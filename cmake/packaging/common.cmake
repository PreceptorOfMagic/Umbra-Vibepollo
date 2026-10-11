# common packaging

# common cpack options
# Branding: Umbra (Vibepollo) -- Umbra's co-op host built on Vibepollo (Nonary), which is built on Apollo.
set(CPACK_PACKAGE_NAME "Umbra (Vibepollo)")
set(CPACK_PACKAGE_VENDOR ${SUNSHINE_PUBLISHER_NAME})
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION_NUMERIC})
set(CPACK_PACKAGE_VERSION_MAJOR ${PROJECT_VERSION_MAJOR})
set(CPACK_PACKAGE_VERSION_MINOR ${PROJECT_VERSION_MINOR})
set(CPACK_PACKAGE_VERSION_PATCH ${PROJECT_VERSION_PATCH})
set(CPACK_PACKAGE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/cpack_artifacts)
set(CPACK_PACKAGE_CONTACT ${SUNSHINE_PUBLISHER_ISSUE_URL})
set(CPACK_PACKAGE_DESCRIPTION ${CMAKE_PROJECT_DESCRIPTION})
set(CPACK_PACKAGE_HOMEPAGE_URL ${CMAKE_PROJECT_HOMEPAGE_URL})
set(CPACK_RESOURCE_FILE_LICENSE ${PROJECT_SOURCE_DIR}/LICENSE)
set(CPACK_PACKAGE_ICON ${PROJECT_SOURCE_DIR}/sunshine.png)
# Umbra: the project name, as Vibepollo does -- cmake/targets/windows.cmake hands ${PROJECT_NAME}.msi to the
# bootstrapper, which embeds it as a resource (its own extraction name is internal).
set(CPACK_PACKAGE_FILE_NAME "${CMAKE_PROJECT_NAME}")
# A signed build strips its binaries BEFORE they are signed, because stripping afterwards removes
# the signature, and then packs them untouched (.github/workflows/release-windows-signed.yml).
option(UMBRA_PACKAGE_PRESTRIPPED "Binaries are already stripped and signed; CPack must not strip them" OFF)
if(NOT UMBRA_PACKAGE_PRESTRIPPED)
    set(CPACK_STRIP_FILES YES)
endif()

# Umbra: install the release notices with the required application component so every
# package carries the same legal and source-delivery material.
install(FILES
        "${PROJECT_SOURCE_DIR}/LICENSE"
        "${PROJECT_SOURCE_DIR}/NOTICE"
        "${PROJECT_SOURCE_DIR}/THIRD-PARTY-NOTICES.md"
        "${PROJECT_SOURCE_DIR}/SOURCE-MANIFEST.template.md"
        "${PROJECT_SOURCE_DIR}/SOURCE-MANIFEST.md"
        DESTINATION "."
        COMPONENT application)
install(DIRECTORY "${PROJECT_SOURCE_DIR}/packaging/licenses/"
        DESTINATION "licenses"
        COMPONENT application)

# install common assets
install(DIRECTORY "${SUNSHINE_SOURCE_ASSETS_DIR}/common/assets/"
        DESTINATION "${SUNSHINE_ASSETS_DIR}"
        PATTERN "web" EXCLUDE
        PATTERN "web-legacy" EXCLUDE)
# copy assets to build directory, for running without install
file(GLOB_RECURSE ALL_ASSETS
        RELATIVE "${SUNSHINE_SOURCE_ASSETS_DIR}/common/assets/" "${SUNSHINE_SOURCE_ASSETS_DIR}/common/assets/*")
list(FILTER ALL_ASSETS EXCLUDE REGEX "^web(-legacy)?/.*$")  # Filter out browser source directories
foreach(asset ${ALL_ASSETS})  # Copy assets to build directory, excluding browser source directories
    file(COPY "${SUNSHINE_SOURCE_ASSETS_DIR}/common/assets/${asset}"
            DESTINATION "${CMAKE_CURRENT_BINARY_DIR}/assets")
endforeach()

# Vite writes the complete browser application directly into the runtime asset
# tree. Fail packaging when it has not been built so an installer can never
# silently ship an API-only configuration endpoint.
install(CODE "
    if(NOT EXISTS \"${CMAKE_CURRENT_BINARY_DIR}/assets/web/index.html\")
        message(FATAL_ERROR \"Vibepollo legacy Web UI is missing. Build the web_ui target before packaging.\")
    endif()
    if(NOT EXISTS \"${CMAKE_CURRENT_BINARY_DIR}/assets/web/v2/index.html\")
        message(FATAL_ERROR \"Vibepollo v2 Web UI is missing. Build the web_ui target before packaging.\")
    endif()
" COMPONENT assets)
install(DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/assets/web/"
        DESTINATION "${SUNSHINE_ASSETS_DIR}/web"
        COMPONENT assets)

# platform specific packaging
if(WIN32)
    include(${CMAKE_MODULE_PATH}/packaging/windows.cmake)
    # WiX specifics: ensure license is RTF and set stable Upgrade GUID
    set(CPACK_RESOURCE_FILE_LICENSE ${PROJECT_SOURCE_DIR}/packaging/windows/LICENSE.rtf)
    set(CPACK_WIX_UPGRADE_GUID "{E3FA501A-85F8-4187-85A7-D6E6BDC7EDA1}")
elseif(UNIX)
    include(${CMAKE_MODULE_PATH}/packaging/unix.cmake)

    if(APPLE)
        include(${CMAKE_MODULE_PATH}/packaging/macos.cmake)
    else()
        include(${CMAKE_MODULE_PATH}/packaging/linux.cmake)
    endif()
endif()

include(CPack)
