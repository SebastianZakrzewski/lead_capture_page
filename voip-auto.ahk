#Requires AutoHotkey v2.0
#SingleInstance Force

; --- Ustawienia ---
global PollMs := 10
global CooldownMs := 500
global AnswerGuardMs := 5000
global SettleMs := 80
global ActivateTimeout := 0.25
global AnswerHotkey := "^+a"
global RequireIncomingTitle := false
global UseWinEvent := true
global VoIPExe := "ahk_exe VoIPstudio.exe"
global VoIPProcess := "VoIPstudio.exe"
global VoIPMain := "ahk_exe VoIPstudio.exe ahk_class Chrome_WidgetWin_1"
global LogFile := A_ScriptDir "\voip-auto.log"
global DebugWindows := false

global paused := false
global lastFire := 0
global lastAnswerTick := 0
global prevCount := 0
global prevAllHwnds := Map()
global knownHwnds := Map()
global baselineHwnds := Map()
global hookActive := false
global hookPid := 0
global winEventCallback := 0
global winEventHook := 0
global answerInProgress := false
global debouncePending := false
global debounceHwnd := 0
global debounceSource := ""

SetKeyDelay(-1, -1)
SetWinDelay(-1)
SendMode("Input")

GetAllVoIPHwnds() {
    windows := Map()
    for hwnd in WinGetList(VoIPExe) {
        if !IsTrackableWindow(hwnd)
            continue
        windows[hwnd] := WindowLabel(hwnd)
    }
    return windows
}

WindowLabel(hwnd) {
    try {
        title := WinGetTitle("ahk_id " hwnd)
        class := WinGetClass("ahk_id " hwnd)
        return title ' [' class ']'
    } catch {
        return "(nieznane)"
    }
}

FindNewWindows(curr, prev) {
    newOnes := []
    for hwnd, label in curr {
        if !prev.Has(hwnd)
            newOnes.Push(hwnd)
    }
    return newOnes
}

WindowSummary(windows) {
    parts := []
    for hwnd, label in windows
        parts.Push(hwnd ' "' label '"')
    list := ""
    for part in parts
        list .= (list ? ", " : "") part
    return "[" parts.Length "] " (list ? list : "(brak)")
}

Log(msg) {
    global LogFile
    try
        FileAppend(Format("{} - {}\n", FormatTime(, "yyyy-MM-dd HH:mm:ss"), msg), LogFile, "UTF-8")
}

OnExit(ExitReason, ExitCode) {
    Log("Skrypt zakończony — powód: " ExitReason ", kod: " ExitCode)
    StopWinEventHook()
    SetTimer(ProcessDebouncedAnswer, 0)
}

IsVoIPWindow(hwnd) {
    if !hwnd || !WinExist("ahk_id " hwnd)
        return false
    try
        return WinGetProcessName("ahk_id " hwnd) = VoIPProcess
    catch
        return false
}

IsTrackableWindow(hwnd) {
    if !IsVoIPWindow(hwnd)
        return false
    try {
        title := WinGetTitle("ahk_id " hwnd)
        class := WinGetClass("ahk_id " hwnd)
    } catch
        return false

    if class = "Intermediate D3D Window"
        return false
    if title = "" && class != "Chrome_RenderWidgetHostHWND"
        return false
    return true
}

IsTriggerWindow(hwnd) {
    if !IsTrackableWindow(hwnd)
        return false
    try {
        title := WinGetTitle("ahk_id " hwnd)
        class := WinGetClass("ahk_id " hwnd)
    } catch
        return false

    if title = "Chrome Legacy Window"
        return false
    if class = "Chrome_RenderWidgetHostHWND"
        return true
    if class = "Chrome_WidgetWin_1" && title != ""
        return true
    return false
}

TitleMatchesAny(title, patterns) {
    titleLower := StrLower(title)
    for pattern in patterns {
        if InStr(titleLower, StrLower(pattern))
            return true
    }
    return false
}

IsAnswerGuardActive() {
    global lastAnswerTick, AnswerGuardMs
    return (A_TickCount - lastAnswerTick) < AnswerGuardMs
}

IsCooldownActive() {
    global lastFire, CooldownMs
    return (A_TickCount - lastFire) < CooldownMs
}

IsActiveCallWindow(title) {
    static patterns := [
        "on call", "in call", "connected", "active call", "speaking",
        "rozmowa", "połączono", "polaczono", "w trakcie", "rozmawiasz", "trwa rozmowa"
    ]
    return TitleMatchesAny(title, patterns)
}

IsIncomingCallWindow(title) {
    static patterns := [
        "incoming", "ringing", "dzwoni", "dzwonienie",
        "przychodzące", "przychodzace", "call from", "połączenie przychodzące", "polaczenie przychodzace"
    ]
    return TitleMatchesAny(title, patterns)
}

InitBaseline() {
    global baselineHwnds, knownHwnds, prevAllHwnds, prevCount
    baselineHwnds := GetAllVoIPHwnds()
    knownHwnds := baselineHwnds.Clone()
    prevAllHwnds := baselineHwnds.Clone()
    prevCount := baselineHwnds.Count
    Log("Bazowe okna VoIP: " WindowSummary(baselineHwnds))
}

SyncState() {
    global prevAllHwnds, prevCount, knownHwnds
    curr := GetAllVoIPHwnds()
    prevAllHwnds := curr
    prevCount := curr.Count
    for hwnd, label in curr
        knownHwnds[hwnd] := label
}

PruneKnownWindows() {
    global knownHwnds
    for hwnd in knownHwnds.Clone()
        if !WinExist("ahk_id " hwnd)
            knownHwnds.Delete(hwnd)
}

SkipReason(hwnd, viaCountIncrease := false) {
    global knownHwnds, baselineHwnds, RequireIncomingTitle

    if !IsVoIPWindow(hwnd)
        return "nie jest oknem VoIP"
    if answerInProgress
        return "trwa odbiór"
    if IsCooldownActive()
        return "cooldown"
    if IsAnswerGuardActive()
        return "guard po odebraniu"
    if knownHwnds.Has(hwnd)
        return "hwnd już znany"
    if !viaCountIncrease && baselineHwnds.Has(hwnd)
        return "okno bazowe"
    if !IsTriggerWindow(hwnd)
        return "okno nie jest triggerem połączenia"

    try title := WinGetTitle("ahk_id " hwnd)
    catch
        return "brak tytułu"

    if IsActiveCallWindow(title)
        return "okno aktywnej rozmowy"
    if RequireIncomingTitle && !IsIncomingCallWindow(title)
        return "brak frazy incoming w tytule"
    return ""
}

RememberWindow(hwnd) {
    global knownHwnds
    if !hwnd || !WinExist("ahk_id " hwnd)
        return
    knownHwnds[hwnd] := WindowLabel(hwnd)
}

ActivateVoIPMain() {
    global VoIPMain, VoIPExe, ActivateTimeout

    targetId := WinExist(VoIPMain)
    if !targetId
        targetId := WinExist(VoIPExe)
    if !targetId
        return false

    WinActivate("ahk_id " targetId)
    return WinWaitActive("ahk_id " targetId, , ActivateTimeout)
}

AnswerCall(reason, hwnd := 0) {
    global lastFire, lastAnswerTick, AnswerHotkey, AnswerGuardMs, SettleMs, answerInProgress

    if answerInProgress
        return false
    if IsCooldownActive()
        return false
    if IsAnswerGuardActive()
        return false

    answerInProgress := true
    now := A_TickCount
    lastFire := now
    lastAnswerTick := now

    triggerLabel := hwnd ? WindowLabel(hwnd) : "(brak)"
    Log('ODBiór [' now 'ms]: ' reason ' trigger=' hwnd ' "' triggerLabel '"')

    try {
        if SettleMs > 0
            Sleep(SettleMs)

        if !ActivateVoIPMain() {
            Log("Ostrzeżenie: nie udało się aktywować głównego okna VoIP — wysyłam skrót mimo to")
        }

        SendInput(AnswerHotkey)
        Log("Wysłano " AnswerHotkey " po " (A_TickCount - now) " ms (guard " AnswerGuardMs " ms)")
        SyncState()
        return true
    } finally {
        answerInProgress := false
    }
}

AttemptAnswer(source, hwnd, viaCountIncrease := false) {
    reason := SkipReason(hwnd, viaCountIncrease)
    if reason {
        if IsTrackableWindow(hwnd)
            Log('Pominięto hwnd=' hwnd ' "' WindowLabel(hwnd) '" — ' reason ' [' source ']')
        RememberWindow(hwnd)
        return false
    }

    RememberWindow(hwnd)
    return AnswerCall(source, hwnd)
}

ScheduleDebouncedAnswer(source, hwnd) {
    global debouncePending, debounceHwnd, debounceSource, SettleMs

    debounceSource := source
    debounceHwnd := hwnd
    if debouncePending
        return

    debouncePending := true
    delay := Max(SettleMs, 1)
    SetTimer(ProcessDebouncedAnswer, -delay)
}

ProcessDebouncedAnswer(*) {
    global debouncePending, debounceHwnd, debounceSource

    debouncePending := false
    hwnd := debounceHwnd
    source := debounceSource
    debounceHwnd := 0
    debounceSource := ""

    if !hwnd || paused
        return
    AttemptAnswer(source, hwnd, false)
}

HandleDetectedWindows(newHwnds, source, viaCountIncrease := false) {
    global paused

    if paused {
        for hwnd in newHwnds
            RememberWindow(hwnd)
        return
    }

    chosen := 0
    for hwnd in newHwnds {
        if IsTriggerWindow(hwnd) {
            chosen := hwnd
            break
        }
    }
    if !chosen && newHwnds.Length > 0
        chosen := newHwnds[1]

    for hwnd in newHwnds {
        if hwnd = chosen
            continue
        RememberWindow(hwnd)
    }

    if !chosen
        return

    if source = "hook WinEvent" {
        ScheduleDebouncedAnswer(source, chosen)
        return
    }

    AttemptAnswer(source, chosen, viaCountIncrease)
}

VoIPWinEventCallback(hWinEventHook, Event, hWnd, idObject, idChild, dwEventThread, dwmsEventTime) {
    static EVENT_OBJECT_SHOW := 0x8002

    if idObject != 0 || Event != EVENT_OBJECT_SHOW || !hWnd
        return
    if !IsTrackableWindow(hWnd)
        return
    if knownHwnds.Has(hWnd)
        return

    ScheduleDebouncedAnswer("hook WinEvent", hWnd)
}

StartWinEventHook(pid := 0) {
    global hookActive, winEventCallback, winEventHook, hookPid, PollMs, UseWinEvent

    static EVENT_OBJECT_SHOW := 0x8002
    static WINEVENT_OUTOFCONTEXT := 0x0000

    if !UseWinEvent {
        StopWinEventHook()
        return
    }

    if !pid
        pid := ProcessExist(VoIPProcess)

    if hookActive && pid = hookPid
        return

    StopWinEventHook()

    if !pid {
        Log("VoIPstudio nie działa — hook włączy się po uruchomieniu aplikacji")
        return
    }

    winEventCallback := CallbackCreate(VoIPWinEventCallback, "F", 7)
    winEventHook := DllCall(
        "SetWinEventHook",
        "UInt", EVENT_OBJECT_SHOW,
        "UInt", EVENT_OBJECT_SHOW,
        "Ptr", 0,
        "Ptr", winEventCallback,
        "UInt", pid,
        "UInt", 0,
        "UInt", WINEVENT_OUTOFCONTEXT,
        "Ptr")

    if !winEventHook {
        Log("Ostrzeżenie: WinEvent hook nieaktywny — działa tylko polling co " PollMs " ms")
        return
    }

    hookPid := pid
    hookActive := true
    Log("WinEvent hook aktywny dla PID " pid " (tylko SHOW, tylko VoIPstudio)")
}

StopWinEventHook() {
    global hookActive, winEventHook, winEventCallback, hookPid

    if winEventHook {
        DllCall("UnhookWinEvent", "Ptr", winEventHook)
        winEventHook := 0
    }
    if winEventCallback {
        CallbackFree(winEventCallback)
        winEventCallback := 0
    }
    hookActive := false
    hookPid := 0
}

EnsureVoIPHook() {
    pid := ProcessExist(VoIPProcess)
    if pid != hookPid
        StartWinEventHook(pid)
}

CheckVoIP() {
    global paused, prevCount, prevAllHwnds, DebugWindows, UseWinEvent, answerInProgress, debouncePending

    if paused
        return

    EnsureVoIPHook()
    PruneKnownWindows()

    curr := GetAllVoIPHwnds()
    count := curr.Count
    newHwnds := FindNewWindows(curr, prevAllHwnds)
    viaCountIncrease := prevCount > 0 && count > prevCount

    if DebugWindows && (count != prevCount || newHwnds.Length)
        Log("Okna: " WindowSummary(curr))

    if newHwnds.Length {
        source := viaCountIncrease
            ? "poll wzrost okien " prevCount "→" count
            : "poll nowe okno"
        HandleDetectedWindows(newHwnds, source, viaCountIncrease)
        prevAllHwnds := curr
        prevCount := count
        return
    }

    if viaCountIncrease && !UseWinEvent && !answerInProgress && !debouncePending {
        for hwnd, label in curr {
            if !prevAllHwnds.Has(hwnd) {
                HandleDetectedWindows([hwnd], "poll wzrost okien " prevCount "→" count, true)
                prevAllHwnds := curr
                prevCount := count
                return
            }
        }
    }

    prevAllHwnds := curr
    prevCount := count
}

DumpWindows() {
    summary := WindowSummary(GetAllVoIPHwnds())
    Log("Zrzut okien: " summary)
    TrayTip("VoIP Auto-Answer", summary, 3)
}

TogglePause() {
    global paused
    paused := !paused
    state := paused ? "PAUZA" : "AKTYWNY"
    TrayTip("VoIP Auto-Answer", state, 1)
    Log("Stan: " state)
}

ToggleDebug() {
    global DebugWindows
    DebugWindows := !DebugWindows
    state := DebugWindows ? "WŁĄCZONY" : "WYŁĄCZONY"
    TrayTip("VoIP debug", state, 1)
    Log("Debug okien: " state)
}

ExitScript() {
    Log("Zamknięcie na żądanie użytkownika (Ctrl+Shift+Esc)")
    ExitApp()
}

; --- Start ---
InitBaseline()
StartWinEventHook()
Log("Skrypt uruchomiony — poll=" PollMs "ms, cooldown=" CooldownMs "ms, guard=" AnswerGuardMs "ms, settle=" SettleMs "ms")
Log("Sterowanie: F8 pauza | F9 okna | F10 debug | Ctrl+Shift+Esc wyjście")
TrayTip("VoIP Auto-Answer", "Poprawiony tryb — F8: pauza, Ctrl+Shift+Esc: wyjście", 3)
SetTimer(CheckVoIP, PollMs)

F8::TogglePause()
F9::DumpWindows()
F10::ToggleDebug()
^+Esc::ExitScript()
