#include "pch.h"

namespace util
{
	std::filesystem::path get_base() {
		wchar_t buf[MAX_PATH];
		GetModuleFileNameW(NULL, buf, MAX_PATH);

		return std::filesystem::path{ buf }.parent_path() / "";
	}

	std::filesystem::path get_file(const char* name) {
		return get_base().append(name);
	}

	const char* get_studio_path() {
		HKEY key;
		RegOpenKeyEx(HKEY_CLASSES_ROOT, L"roblox-studio\\DefaultIcon", 0, KEY_ALL_ACCESS, &key);

		wchar_t path[MAX_PATH] = L"";
		DWORD size = MAX_PATH;
		DWORD type = REG_SZ;
		RegQueryValueEx(key, NULL, NULL, &type, (LPBYTE)&path, &size);
		 
		char buf[MAX_PATH] = { 0 };
		size_t chars = 0;
		wcstombs_s(&chars, buf, path, MAX_PATH);

		return buf;
	}
};

