/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** write_wave.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_wave(int len, char *wd)
{
    if (len == 0)
        return dprintf(STDOUT_FILENO,
            "%s%s>", str_term_caps[MAGENTA], wd) + 1;
    return dprintf(STDOUT_FILENO,
            "%s~%s>", str_term_caps[MAGENTA], wd) + 1;
}
