#include "pch.h"

class Injector {
public:
    Injector() {};

    void inject(const char* process_name, const char* dll_path) {
        DWORD process_id = 0;
        while (process_id == 0) {
            process_id = get_process_id(process_name);
            Sleep(10);
        }

        HANDLE process = OpenProcess(PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_CREATE_THREAD, 0, process_id);
        LPVOID remote = VirtualAllocEx(process, NULL, strlen(dll_path) + 1, MEM_COMMIT, PAGE_READWRITE);
        LPVOID load_lib = GetProcAddress(LoadLibraryA("kernel32.dll"), "LoadLibraryA");

        WriteProcessMemory(process, remote, dll_path, strlen(dll_path) + 1, 0);
        CreateRemoteThread(process, NULL, NULL, (LPTHREAD_START_ROUTINE)load_lib, remote, NULL, NULL);
    }

private:
    DWORD get_process_id(const char* name) {
        HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);
        PROCESSENTRY32 entry;
        entry.dwSize = sizeof(PROCESSENTRY32);

        char buf[MAX_PATH] = { 0 };
        size_t chars = 0;

        if (Process32First(snapshot, &entry) == TRUE)
        {
            while (Process32Next(snapshot, &entry) == TRUE)
            {
                wcstombs_s(&chars, buf, entry.szExeFile, MAX_PATH);
                if (_stricmp(buf, name) == 0)
                {
                    return entry.th32ProcessID;
                }
            }
        }
        return 0;
    }
};