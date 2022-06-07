// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"
#include "detours.h"
#include <QtCore/QtCore>
#include <fstream>
#include <streambuf>
#include <iostream>
#include "windows.h"
#include "string"

std::string str;

typedef QJsonDocument(__fastcall* func_format)(const QByteArray& json, QJsonParseError* error);

HINSTANCE qt_core = LoadLibrary(TEXT("Qt5Core.dll"));
func_format func = (func_format)GetProcAddress(qt_core, "?fromJson@QJsonDocument@@SA?AV1@AEBVQByteArray@@PEAUQJsonParseError@@@Z");

QJsonDocument func_hook(const QByteArray& json, QJsonParseError* error) {
    QJsonDocument doc = func(json, error);

    if (!doc.isNull()) {
        QJsonObject obj = doc.object();

        if (obj.contains("Name")) {
            QJsonValue val = obj.value("Name");
            const char* name = val.toString().toStdString().c_str();

            if (strcmp(name, "Dark")) {
                return func(QByteArray(str.c_str(), str.length()), error);
            }
        }
    }

    return doc;
}

BOOL WINAPI DllMain(IN HINSTANCE hDllHandle,
    IN DWORD     nReason,
    IN LPVOID    Reserved)
{
    switch (nReason)
    {
    case DLL_PROCESS_ATTACH:
    {
        AllocConsole();
        FILE* fDummy;
        freopen_s(&fDummy, "CONIN$", "r", stdin);
        freopen_s(&fDummy, "CONOUT$", "w", stderr);
        freopen_s(&fDummy, "CONOUT$", "w", stdout);
        TCHAR buf[MAX_PATH] = { 0 };
        GetModuleFileName(NULL, buf, MAX_PATH);

        std::string path = (std::string)buf;
        path = path.substr(0, path.find_last_of("\\/"));

        std::ifstream file(path + "\\current_theme.json");
        str = std::string((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

        DetourUpdateThread(GetCurrentThread());
        DetourTransactionBegin();
        DetourAttach(&(PVOID&)func, func_hook);
        DetourTransactionCommit();
        break;
    }

    case DLL_PROCESS_DETACH:

        break;
    }

    return TRUE;
}