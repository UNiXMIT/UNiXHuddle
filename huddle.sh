#!/bin/bash

containerName=huddle
containerRepo=mf/huddle
runOptions=(
-v /home/support/huddle:/home/node/huddle
--restart always
-p 3000:3000
--health-cmd "curl -sf http://127.0.0.1:3000 || exit 1"
--health-interval 30s
--health-timeout 10s
--health-retries 3
)

checkContainerRuntime() {
    printf "Checking Container Runtime...\n\n"
    containerRuntime=$(which docker 2>/dev/null) ||
        containerRuntime=$(which podman 2>/dev/null) ||
        {
            printf "!!!No docker or podman executable found in your PATH!!!\n\n"
            exit 1
        }
    printf "Using Container Runtime - ${containerRuntime}\n\n"
}

removeContainer() {
    if [[ -n "$(sudo ${containerRuntime} ps -a -q -f name=${containerName})" ]]; then
        printf "Removing Container...\n\n"
        sudo ${containerRuntime} stop ${containerName} >/dev/null
        sudo ${containerRuntime} wait ${containerName} >/dev/null
        sudo ${containerRuntime} rm ${containerName} >/dev/null
    fi
}

buildContainer() {
    printf "Building Container...\n\n"
    sudo ${containerRuntime} build --tag ${containerRepo} -f Dockerfile
}

startContainer() {
    printf "Starting Container...\n\n"
    sudo ${containerRuntime} run -d --name ${containerName} "${runOptions[@]}" ${containerRepo} 
}

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
checkContainerRuntime
removeContainer
buildContainer
startContainer