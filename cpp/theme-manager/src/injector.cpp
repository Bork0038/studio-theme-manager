#include "injector.hpp"
#include "utils.hpp"

#include <Windows.h>
#include <tlhelp32.h>
#include <string>

void injector::inject( const std::string& process_name, const char* dll_path )
{
	DWORD process_id = 0;
	while ( process_id == 0 )
	{
		process_id = get_process_id( process_name.c_str() );
		Sleep( 10 );
	}

	HANDLE process = OpenProcess( PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_CREATE_THREAD, 0, process_id );
	LPVOID remote = VirtualAllocEx( process, NULL, strlen( dll_path ) + 1, MEM_COMMIT, PAGE_READWRITE );
	LPVOID load_lib = GetProcAddress( LoadLibraryA( "kernel32.dll" ), "LoadLibraryA" );

	WriteProcessMemory( process, remote, dll_path, strlen( dll_path ) + 1, 0 );
	CreateRemoteThread( process, NULL, NULL, ( LPTHREAD_START_ROUTINE ) load_lib, remote, NULL, NULL );
}

DWORD injector::get_process_id( const std::string& name )
{
	HWND window_handle = FindWindowA( NULL, name.c_str() );

	DWORD process_id;
	GetWindowThreadProcessId( window_handle, &process_id );

	return process_id;
}