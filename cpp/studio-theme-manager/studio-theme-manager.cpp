#include "pch.h"
#include "util.h"
#include "injector.h"
#include <Commdlg.h>

void updateRegistry(char * args) {
    HKEY key;
    std::wstring path = std::wstring_convert<std::codecvt_utf8<wchar_t>>().from_bytes(('"' + (std::string)args + "\" %1").c_str());

    RegOpenKeyEx(HKEY_CLASSES_ROOT, L"roblox-studio\\shell\\open\\command", 0, KEY_ALL_ACCESS, &key);
    RegSetValueEx(key, NULL, 0, REG_SZ, (LPBYTE)path.c_str(), sizeof(wchar_t) * (path.size() + 1));
}

int main(int argc, char* argv[])
{
    FreeConsole();
    std::string studio_path = util::get_studio_path();

    STARTUPINFOA startup;
    PROCESS_INFORMATION process_information;

    ZeroMemory(&startup, sizeof(startup));
    startup.cb = sizeof(startup);
    ZeroMemory(&process_information, sizeof(process_information));

    std::string cmd = studio_path;
    for (int i = 1; i < argc; i++) {
        cmd += (std::string)" " + argv[i];
    }

    CreateProcessA(
        NULL,
        (LPSTR)cmd.c_str(),
        NULL,
        NULL,
        FALSE,
        0,
        NULL,
        NULL,
        &startup,
        &process_information
    );

    const char* dll_path = util::path_to_char(util::get_file("theme-hook.dll"));

    Injector *injector = new Injector;
    injector->inject("RobloxStudioBeta.exe", dll_path);


    WaitForSingleObject(process_information.hProcess, INFINITE);
    updateRegistry(argv[0]);
}
