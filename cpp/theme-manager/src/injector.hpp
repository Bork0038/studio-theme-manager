#pragma once

#include <Windows.h>
#include <string>
#include <filesystem>

namespace fs = std::filesystem;

namespace injector
{
	void inject( const std::string& process_name, const fs::path& dll_path );
	DWORD get_process_id( const std::string& name );
}