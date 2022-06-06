#include "includes.h"
#include "injector.h"

DWORD Injector::get_process_id(std::string_view name) const {
    const auto snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);
    PROCESSENTRY32 entry;
    entry.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(snapshot, &entry) == true)
    {
        while (Process32Next(snapshot, &entry) == true)
        {
            if (strcmp((char*)entry.szExeFile, name.data()) == 0)
            {
                return entry.th32ProcessID;
            }
        }
    }
    return 0;
}

void Injector::inject(std::string_view process_name, std::string_view dll_path) const {
    auto process_id = 0;
    while (process_id == 0) {
        process_id = Injector::get_process_id(process_name);
        Sleep(10);
    }

    const auto process = OpenProcess(PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_CREATE_THREAD, 0, process_id);
    const auto remote = VirtualAllocEx(process, NULL, strlen(dll_path.data()) + 1, MEM_COMMIT, PAGE_READWRITE);
    const auto load_lib = GetProcAddress(LoadLibraryA("kernel32.dll"), "LoadLibraryA");

    WriteProcessMemory(process, remote, dll_path.data(), strlen(dll_path.data()) + 1, 0);
    CreateRemoteThread(process, NULL, NULL, (LPTHREAD_START_ROUTINE)load_lib, remote, NULL, NULL);
}
