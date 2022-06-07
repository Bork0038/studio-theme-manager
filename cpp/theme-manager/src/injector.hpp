#pragma once

#include <Windows.h>
#include <string>

namespace injector
{
	void inject( const std::string& process_name, const char* dll_path );
	DWORD get_process_id( const std::string& name );
}