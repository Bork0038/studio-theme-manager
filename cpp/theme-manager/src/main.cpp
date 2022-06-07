#include "injector.hpp"
#include "utils.hpp"

#include <Windows.h>
#include <synchapi.h>
#include <string>
#include <iostream>

#include <filesystem>

namespace fs = std::filesystem;

int main( int argc, char* argv[] )
{
	fs::path studio_path { utils::get_studio_path( ) };
	fs::path exe_path { argv[ 0 ] };

	std::string args { studio_path.string( ) }; // append to this

	/*****/

	STARTUPINFOA startup;
	PROCESS_INFORMATION process_information;

	ZeroMemory( &startup, sizeof( startup ) );
	startup.cb = sizeof( startup );
	ZeroMemory( &process_information, sizeof( process_information ) );

	for ( int i = 1; i < argc; i++ )
		args += ' ' + argv[ i ];

	CreateProcessA(
		NULL,
		( LPSTR ) args.c_str( ),
		NULL, NULL, FALSE, 0, NULL, NULL,
		&startup,
		&process_information 
	);

	/*****/

	auto dll_path = utils::get_file( "theme-hook.dll" ).string( );
	injector::inject( "RobloxStudioBeta.exe", dll_path.c_str( ) );

	std::cout << studio_path << "\n";
	std::cout << exe_path << "\n";
	std::cout << args << "\n";

	WaitForSingleObject( process_information.hProcess, INFINITE );
	utils::rbx_studio_open( exe_path ); // makes it so that this runs on roblox studio startup lol
}