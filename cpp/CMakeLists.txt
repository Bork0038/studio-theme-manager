cmake_minimum_required(VERSION 3.22)

#set(CMAKE_GENERATOR_PLATFORM x64)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED true)

## projects ##
project(theme-manager VERSION 0.1)
project(theme-hook VERSION 0.1)

add_subdirectory(theme-manager)
add_subdirectory(theme-hook)
