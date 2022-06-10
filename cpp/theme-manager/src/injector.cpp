#include "injector.hpp"
#include "utils.hpp"

#include <Windows.h>
#include <filesystem>
#include <iostream>
#include <string>
#include <tlhelp32.h>

namespace fs = std::filesystem;

void injector::inject( const std::string& process_name, const fs::path& dll_path )
{
	if ( !fs::exists( dll_path ) )
	{
		std::cerr << "dll is not in current path!\n";
		return;
	}

	DWORD process_id = 0;
	while ( process_id == 0 )
	{
		process_id = get_process_id( process_name.c_str( ) );
		Sleep( 10 );
	}

	std::cout << "pid: " << process_id << "\n";

	HANDLE process = OpenProcess( PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_CREATE_THREAD, 0, process_id );

	if ( !process )
	{
		std::cerr << GetLastError( ) << "\n";
		return;
	}

	const auto& path = dll_path.string( );

	// bro you wont be executed dumb ass
	LPVOID remote = VirtualAllocEx( process, NULL, strlen( path.c_str( ) ) + 1, MEM_COMMIT, PAGE_READWRITE );
	LPVOID load_lib = GetProcAddress( LoadLibraryA( "kernel32.dll" ), "LoadLibraryA" );

	WriteProcessMemory( process, remote, path.c_str( ), strlen( path.c_str( ) ) + 1, 0 );
	CreateRemoteThread( process, NULL, NULL, ( LPTHREAD_START_ROUTINE ) load_lib, remote, NULL, NULL );

	std::cerr << GetLastError( ) << "\n";

	CloseHandle( process );
}

// no worky
DWORD injector::get_process_id( const std::string& name )
{
	PROCESSENTRY32 entry;
	entry.dwSize = sizeof( PROCESSENTRY32 );

	HANDLE snapshot = CreateToolhelp32Snapshot( TH32CS_SNAPPROCESS, NULL );

	if ( Process32First( snapshot, &entry ) == TRUE )
	{
		while ( Process32Next( snapshot, &entry ) == TRUE )
		{
			if ( stricmp( entry.szExeFile, name.c_str( ) ) == 0 )
			{
				CloseHandle( snapshot );
				return entry.th32ProcessID;
			}
		}
	}

	CloseHandle( snapshot );
	return 0;
}