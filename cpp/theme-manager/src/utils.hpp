#pragma once

#include <Windows.h>
#include <filesystem>
#include <string>

namespace fs = std::filesystem;

namespace utils
{
	std::filesystem::path get_base( );
	std::filesystem::path get_file( const char *name );

	fs::path get_studio_path( );
	void rbx_studio_open( const fs::path& args );
} // namespace utils
