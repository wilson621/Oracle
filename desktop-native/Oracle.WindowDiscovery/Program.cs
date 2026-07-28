using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Oracle.WindowDiscovery;

internal static partial class Program
{
    private const int DwmwaCloaked = 14;
    private const int UoiName = 2;
    private const uint DesktopReadObjects = 0x0001;
    private const uint ErrorUnhandledException = 574;

    private static readonly JsonSerializerOptions JsonOptions =
        new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition =
                JsonIgnoreCondition.Never,
            WriteIndented = false,
        };

    private static int Main()
    {
        try
        {
            DiscoveryResult result =
                WindowEnumerator.Discover();

            WriteDiagnostic(result.Diagnostic);

            if (!result.Succeeded)
            {
                return 1;
            }

            string json = JsonSerializer.Serialize(
                result.Windows,
                JsonOptions
            );

            Console.Out.Write(json);

            return 0;
        }
        catch (Exception exception)
        {
            WriteDiagnostic(
                CreateDiagnostic(
                    "helper-internal-failure",
                    "Oracle native window discovery failed outside the EnumWindows boundary.",
                    null,
                    null,
                    new CallbackProgress
                    {
                        Exception = exception,
                    },
                    CaptureExecutionContext()
                )
            );

            return 1;
        }
    }

    private static void WriteDiagnostic(DiscoveryDiagnostic diagnostic)
    {
        Console.Error.Write(
            JsonSerializer.Serialize(diagnostic, JsonOptions)
        );
    }

    private static DiscoveryDiagnostic CreateDiagnostic(
        string classification,
        string message,
        bool? enumWindowsReturned,
        int? win32Error,
        CallbackProgress progress,
        ExecutionContextSnapshot executionContext
    )
    {
        return new(
            "oracle.window-discovery-diagnostic", 1,
            classification, message,
            enumWindowsReturned, win32Error,
            progress.Invoked, progress.Visited, progress.Eligible,
            progress.TerminationRequested,
            progress.Exception is null
                ? null
                : $"{progress.Exception.GetType().FullName}: {progress.Exception.Message}",
            executionContext);
    }

    private sealed record DiscoveryResult(
        IReadOnlyList<DiscoveredWindow> Windows,
        DiscoveryDiagnostic Diagnostic,
        bool Succeeded);

    private sealed record DiscoveredWindow(
        string Handle,
        string Title,
        int ProcessId,
        string? ProcessName,
        bool Visible,
        bool Minimized,
        int X,
        int Y,
        int Width,
        int Height
    );

    private sealed record DiscoveryDiagnostic(
        string Contract, int ContractVersion,
        string Classification, string Message,
        bool? EnumWindowsReturned, int? Win32Error,
        bool CallbackInvoked, int TopLevelWindowsVisited,
        int EligibleRecordsProduced,
        bool CallbackTerminationRequested,
        string? CallbackException,
        ExecutionContextSnapshot ExecutionContext);

    private sealed record ExecutionContextSnapshot(
        string OperatingSystem, int ProcessId, int SessionId,
        bool UserInteractive, bool Is64BitProcess,
        string WindowStation, string ThreadDesktop,
        string InputDesktop, bool Compatible,
        string? IncompatibilityReason);

    private sealed class CallbackProgress
    {
        internal bool Invoked { get; set; }
        internal int Visited { get; set; }
        internal int Eligible { get; set; }
        internal bool TerminationRequested { get; set; }
        internal Exception? Exception { get; set; }
    }

    private static class WindowEnumerator
    {
        public static DiscoveryResult Discover()
        {
            ExecutionContextSnapshot executionContext =
                CaptureExecutionContext();

            if (!executionContext.Compatible)
            {
                return new DiscoveryResult(
                    [],
                    CreateDiagnostic(
                        "incompatible-execution-context",
                        executionContext.IncompatibilityReason ??
                            "The helper cannot access a compatible Windows desktop.",
                        null,
                        null,
                        new CallbackProgress(),
                        executionContext
                    ),
                    false
                );
            }

            List<DiscoveredWindow> windows = [];
            CallbackProgress progress = new();

            NativeMethods.EnumWindowsCallback callback =
                (windowHandle, _) =>
                {
                    progress.Invoked = true;
                    progress.Visited++;

                    try
                    {
                        TryAddWindow(windowHandle, windows);
                        progress.Eligible = windows.Count;
                        return true;
                    }
                    catch (Exception exception)
                    {
                        progress.TerminationRequested = true;
                        progress.Exception = exception;
                        NativeMethods.SetLastError(ErrorUnhandledException);
                        return false;
                    }
                };

            Marshal.SetLastPInvokeError(0);

            bool completed = NativeMethods.EnumWindows(
                callback,
                IntPtr.Zero
            );
            int errorCode = Marshal.GetLastPInvokeError();

            GC.KeepAlive(callback);

            if (completed)
            {
                windows.Sort(CompareWindows);

                return new DiscoveryResult(
                    windows,
                    CreateDiagnostic(
                        windows.Count > 0
                            ? "completed-with-records"
                            : "completed-no-eligible-records",
                        windows.Count > 0
                            ? "EnumWindows completed with eligible records."
                            : "EnumWindows completed with zero eligible records.",
                        true,
                        null,
                        progress,
                        executionContext
                    ),
                    true
                );
            }

            string classification;
            string message;

            if (progress.TerminationRequested)
            {
                classification = "callback-terminated";
                message =
                    "The callback terminated enumeration after containing a managed exception.";
            }
            else if (errorCode != 0)
            {
                classification = "native-enumeration-failure";
                message =
                    $"EnumWindows returned false with Win32 error {errorCode}.";
            }
            else
            {
                classification = "ambiguous-zero-result";
                message =
                    "EnumWindows returned false with Win32 error 0 and no callback-requested termination.";
            }

            return new DiscoveryResult(
                [],
                CreateDiagnostic(
                    classification,
                    message,
                    false,
                    errorCode,
                    progress,
                    executionContext
                ),
                false
            );
        }

        private static void TryAddWindow(
            IntPtr windowHandle,
            ICollection<DiscoveredWindow> windows
        )
        {
            if (
                windowHandle == IntPtr.Zero ||
                !NativeMethods.IsWindowVisible(
                    windowHandle
                )
            )
            {
                return;
            }

            if (IsCloaked(windowHandle))
            {
                return;
            }

            string? title = GetWindowTitle(
                windowHandle
            );

            if (string.IsNullOrWhiteSpace(title))
            {
                return;
            }

            if (
                !NativeMethods.GetWindowRect(
                    windowHandle,
                    out NativeMethods.Rect rectangle
                )
            )
            {
                return;
            }

            int width =
                rectangle.Right - rectangle.Left;

            int height =
                rectangle.Bottom - rectangle.Top;

            if (width <= 0 || height <= 0)
            {
                return;
            }

            _ = NativeMethods.GetWindowThreadProcessId(
                windowHandle,
                out uint nativeProcessId
            );

            if (
                nativeProcessId >
                int.MaxValue
            )
            {
                return;
            }

            int processId =
                (int)nativeProcessId;

            string? processName =
                GetProcessName(processId);

            windows.Add(
                new DiscoveredWindow(
                    Handle:
                        windowHandle
                            .ToInt64()
                            .ToString(
                                System.Globalization
                                    .CultureInfo
                                    .InvariantCulture
                            ),
                    Title: title,
                    ProcessId: processId,
                    ProcessName: processName,
                    Visible: true,
                    Minimized:
                        NativeMethods.IsIconic(
                            windowHandle
                        ),
                    X: rectangle.Left,
                    Y: rectangle.Top,
                    Width: width,
                    Height: height
                )
            );
        }

        private static string? GetWindowTitle(
            IntPtr windowHandle
        )
        {
            int titleLength =
                NativeMethods.GetWindowTextLength(
                    windowHandle
                );

            if (titleLength <= 0)
            {
                return null;
            }

            StringBuilder titleBuilder =
                new(titleLength + 1);

            int copiedCharacters =
                NativeMethods.GetWindowText(
                    windowHandle,
                    titleBuilder,
                    titleBuilder.Capacity
                );

            if (copiedCharacters <= 0)
            {
                return null;
            }

            string title =
                titleBuilder.ToString().Trim();

            return title.Length > 0
                ? title
                : null;
        }

        private static string? GetProcessName(
            int processId
        )
        {
            if (processId <= 0)
            {
                return null;
            }

            try
            {
                using Process process =
                    Process.GetProcessById(
                        processId
                    );

                string processName =
                    process.ProcessName.Trim();

                return processName.Length > 0
                    ? processName
                    : null;
            }
            catch (
                ArgumentException
            )
            {
                return null;
            }
            catch (
                InvalidOperationException
            )
            {
                return null;
            }
            catch (
                System.ComponentModel
                    .Win32Exception
            )
            {
                return null;
            }
            catch (
                NotSupportedException
            )
            {
                return null;
            }
        }

        private static bool IsCloaked(
            IntPtr windowHandle
        )
        {
            int result =
                NativeMethods
                    .DwmGetWindowAttribute(
                        windowHandle,
                        DwmwaCloaked,
                        out int cloaked,
                        sizeof(int)
                    );

            return result == 0 &&
                cloaked != 0;
        }

        private static int CompareWindows(
            DiscoveredWindow left,
            DiscoveredWindow right
        )
        {
            if (
                left.Minimized !=
                right.Minimized
            )
            {
                return left.Minimized
                    ? 1
                    : -1;
            }

            int titleComparison =
                StringComparer
                    .OrdinalIgnoreCase
                    .Compare(
                        left.Title,
                        right.Title
                    );

            if (titleComparison != 0)
            {
                return titleComparison;
            }

            return left.ProcessId.CompareTo(
                right.ProcessId
            );
        }
    }

    private static ExecutionContextSnapshot CaptureExecutionContext()
    {
        const string unsupported =
            "unavailable: unsupported operating system";

        if (!OperatingSystem.IsWindows())
        {
            return new(
                RuntimeInformation.OSDescription,
                Environment.ProcessId,
                -1,
                Environment.UserInteractive,
                Environment.Is64BitProcess,
                unsupported,
                unsupported,
                unsupported,
                false,
                "Oracle.WindowDiscovery supports Windows only."
            );
        }

        int sessionId;
        try
        {
            using Process process = Process.GetCurrentProcess();
            sessionId = process.SessionId;
        }
        catch
        {
            sessionId = -1;
        }

        Marshal.SetLastPInvokeError(0);
        IntPtr windowStation = NativeMethods.GetProcessWindowStation();
        int windowStationError = Marshal.GetLastPInvokeError();

        Marshal.SetLastPInvokeError(0);
        IntPtr threadDesktop = NativeMethods.GetThreadDesktop(
            NativeMethods.GetCurrentThreadId());
        int threadDesktopError = Marshal.GetLastPInvokeError();

        Marshal.SetLastPInvokeError(0);
        IntPtr inputDesktop = NativeMethods.OpenInputDesktop(
            0, false, DesktopReadObjects);
        int inputDesktopError = Marshal.GetLastPInvokeError();
        string inputDesktopDescription =
            inputDesktop == IntPtr.Zero
                ? $"unavailable: OpenInputDesktop failed with Win32 error {inputDesktopError}"
                : DescribeUserObject(inputDesktop, 0);

        if (inputDesktop != IntPtr.Zero)
        {
            _ = NativeMethods.CloseDesktop(inputDesktop);
        }

        bool compatible =
            Environment.UserInteractive &&
            windowStation != IntPtr.Zero &&
            threadDesktop != IntPtr.Zero;
        string? incompatibilityReason = compatible
            ? null
            : string.Join(" ", new[]
            {
                Environment.UserInteractive
                    ? null : "Environment.UserInteractive is false.",
                windowStation != IntPtr.Zero
                    ? null : "No process window station is available.",
                threadDesktop != IntPtr.Zero
                    ? null : "No thread desktop is available.",
            }.Where(reason => reason is not null));

        return new(
            RuntimeInformation.OSDescription,
            Environment.ProcessId,
            sessionId,
            Environment.UserInteractive,
            Environment.Is64BitProcess,
            DescribeUserObject(windowStation, windowStationError),
            DescribeUserObject(threadDesktop, threadDesktopError),
            inputDesktopDescription,
            compatible,
            incompatibilityReason
        );
    }

    private static string DescribeUserObject(
        IntPtr handle, int unavailableError)
    {
        if (handle == IntPtr.Zero)
        {
            return $"unavailable: Win32 error {unavailableError}";
        }

        StringBuilder name = new(256);
        Marshal.SetLastPInvokeError(0);

        bool read = NativeMethods.GetUserObjectInformation(
            handle,
            UoiName,
            name,
            name.Capacity * sizeof(char),
            out _
        );

        return read
            ? name.ToString().TrimEnd('\0')
            : $"unavailable: GetUserObjectInformation failed with Win32 error {Marshal.GetLastPInvokeError()}";
    }

    private static partial class NativeMethods
    {
        [UnmanagedFunctionPointer(CallingConvention.Winapi)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal delegate bool EnumWindowsCallback(
            IntPtr windowHandle,
            IntPtr parameter
        );

        [StructLayout(LayoutKind.Sequential)]
        internal struct Rect
        {
            internal int Left;
            internal int Top;
            internal int Right;
            internal int Bottom;
        }

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool EnumWindows(
            EnumWindowsCallback callback,
            IntPtr parameter
        );

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool IsWindowVisible(
            IntPtr windowHandle
        );

        [LibraryImport(
            "user32.dll",
            EntryPoint =
                "GetWindowTextLengthW",
            SetLastError = true
        )]
        internal static partial int GetWindowTextLength(
            IntPtr windowHandle
        );

        [DllImport(
    "user32.dll",
    EntryPoint = "GetWindowTextW",
    CharSet = CharSet.Unicode,
    SetLastError = true
)]
internal static extern int GetWindowText(
    IntPtr windowHandle,
    StringBuilder text,
    int maximumLength
);

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool GetWindowRect(
            IntPtr windowHandle,
            out Rect rectangle
        );

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool IsIconic(
            IntPtr windowHandle
        );

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        internal static partial uint
            GetWindowThreadProcessId(
                IntPtr windowHandle,
                out uint processId
            );

        [LibraryImport("dwmapi.dll")]
        internal static partial int
            DwmGetWindowAttribute(
                IntPtr windowHandle,
                int attribute,
                out int value,
                int valueSize
            );

        [LibraryImport("user32.dll", SetLastError = true)]
        internal static partial IntPtr GetProcessWindowStation();

        [LibraryImport("user32.dll", SetLastError = true)]
        internal static partial IntPtr GetThreadDesktop(uint threadId);

        [LibraryImport("kernel32.dll")]
        internal static partial uint GetCurrentThreadId();

        [LibraryImport("user32.dll", SetLastError = true)]
        internal static partial IntPtr OpenInputDesktop(
            uint flags,
            [MarshalAs(UnmanagedType.Bool)] bool inherit,
            uint desiredAccess
        );

        [LibraryImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static partial bool CloseDesktop(IntPtr desktop);

        [DllImport(
            "user32.dll",
            EntryPoint = "GetUserObjectInformationW",
            CharSet = CharSet.Unicode,
            SetLastError = true
        )]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetUserObjectInformation(
            IntPtr objectHandle,
            int informationIndex,
            StringBuilder information,
            int informationLength,
            out int requiredLength
        );

        [LibraryImport("kernel32.dll")]
        internal static partial void SetLastError(uint errorCode);
    }
}
