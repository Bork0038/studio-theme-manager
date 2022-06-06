// dllmain.cpp : Defines the entry point for the DLL application.
#include "includes.h"


using func_format = int(__fastcall*)(const int&, int*);
const auto qt_core = LoadLibrary(TEXT("Qt5Core.dll"));
const auto func = (func_format)GetProcAddress(qt_core, "?fromJson@QJsonDocument@@SA?AV1@AEBVQByteArray@@PEAUQJsonParseError@@@Z");

QJsonDocument func_hook(const QByteArray& json, QJsonParseError* error) {
    const auto doc = func(json, error);
    std::string filename_buf;
    GetModuleFileName(nullptr, const_cast<char*>(filename_buf.data()), MAX_PATH);
    auto path = filename_buf.substr(0, filename_buf.find_last_of("\\/"));
    static std::ifstream file(path + "\\current_theme.json");
    std::string str = std::string((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    if (!doc.isNull()) {
       const auto obj = doc.object();

        if (obj.contains("Name")) {
            const auto val = obj.value("Name");
            const char* name = val.toString().toStdString().c_str();

            if (strcmp(name, "Dark")) {
                return (func(QByteArray(str.c_str(), str.length()), error));
            }
        }
    }

    return doc;
}

bool __stdcall DllMain(HINSTANCE, std::uint32_t nReason, LPVOID)
{
    if(nReason == DLL_PROCESS_ATTACH) {
        AllocConsole();
        FILE* fDummy;
        freopen_s(&fDummy, "CONIN$", "r", stdin);
        freopen_s(&fDummy, "CONOUT$", "w", stderr);
        freopen_s(&fDummy, "CONOUT$", "w", stdout);

        DetourUpdateThread(GetCurrentThread());
        DetourTransactionBegin();
        DetourAttach(&(PVOID&)func, func_hook);
        DetourTransactionCommit();
    }
    return true;
}