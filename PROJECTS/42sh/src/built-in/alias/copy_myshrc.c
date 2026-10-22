/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** copy_myshrc
*/

#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include <stdlib.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

void myshrc_cpy(char *path)
{
    char *buffer = open_file(str_env[EX_MYSHRC]);
    int fd = 0;

    if (buffer == NULL)
        return;
    fd = open(path, O_WRONLY | O_CREAT, 0664);
    if (fd == -1) {
        free(buffer);
        return;
    }
    dprintf(fd, "%s", buffer);
    close(fd);
    free(buffer);
}
