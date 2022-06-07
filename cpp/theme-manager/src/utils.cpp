#include "utils.hpp"

#include <Windows.h>
#include <filesystem>
#include <iostream>
#include <string>

namespace fs = std::filesystem;

std::filesystem::path utils::get_base( )
{
	wchar_t buf[ MAX_PATH ];
	GetModuleFileNameW( NULL, buf, MAX_PATH );

	return std::filesystem::path { buf }.parent_path( ) / "";
}

std::filesystem::path utils::get_file( const char* name )
{
	return get_base( ).append( name );
}

fs::path utils::get_studio_path( )
{
	HKEY key;
	RegOpenKeyExA( HKEY_CLASSES_ROOT, "roblox-studio\\DefaultIcon", 0,
				   KEY_ALL_ACCESS, &key );

	char path[ MAX_PATH ];
	DWORD size = MAX_PATH;
	DWORD type = REG_SZ;

	RegQueryValueExA( key, NULL, NULL, &type, ( LPBYTE ) path, &size );
	return fs::path { path };
}

// void utils::rbx_studio_open( std::filesystem::path exe_path )
//  lmao have to fix this also (forgot)

void utils::rbx_studio_open( const fs::path& exe_path )
{
	fs::path path { '"' + exe_path.string( ) + "\" %1" };

	// why tf does this work?
	HKEY key;
	RegOpenKeyExA( HKEY_CLASSES_ROOT, "roblox-studio\\shell\\open\\command", 0, KEY_ALL_ACCESS, &key );
	RegSetValueExA( key, NULL, 0, REG_SZ, ( BYTE* ) path.string( ).c_str( ), path.string().size( ) + 1 );
}