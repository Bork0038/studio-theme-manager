#include "pch.h"
#include "util.h"

namespace util
{
	std::filesystem::path get_file(const char* name) {
		wchar_t buf[MAX_PATH];
		GetModuleFileNameW(NULL, buf, MAX_PATH);

		std::filesystem::path base = std::filesystem::path{ buf }.parent_path() / "";
		return base.append(name);
	}

	const char* path_to_char(std::filesystem::path path) {
		return ((std::string)path.string()).c_str();
	}
};

