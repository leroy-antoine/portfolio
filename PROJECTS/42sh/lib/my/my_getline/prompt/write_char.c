/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** write_char.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_char(prompt_t *variables, system_t *sys)
{
    int print = 0;

    print = dprintf(STDOUT_FILENO, "%c", variables->ch);
    sys->prompt = realloc(sys->prompt,
        sizeof(char) * (print + strlen(sys->prompt) + 1));
    if (sys->prompt == NULL)
        return ERROR;
    sprintf(sys->prompt, "%s%c", sys->prompt, variables->ch);
    return SUCCESS;
}