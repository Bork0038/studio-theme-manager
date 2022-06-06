#include "includes.h"
#include <string_view>

class Injector {
public:
    Injector() = default;

    void inject(std::string_view process_name, std::string_view dll_path) const;
    DWORD get_process_id(std::string_view name) const;
};