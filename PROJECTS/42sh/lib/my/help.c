/*
** EPITECH PROJECT, 2025
** B-MUL-100-PAR-1-1-myhunter-ariel.amriou
** File description:
** main.c
*/

#include <unistd.h>
#include <stddef.h>
#include "my.h"

int help(void)
{
    char *help = open_file(HELP);

    if (help == NULL)
        dprintf(STDERR_FILENO, "Error while opening %s file\n", HELP);
    else
        dprintf(STDOUT_FILENO, "%s", help);
    return EPI_ERROR;
}
