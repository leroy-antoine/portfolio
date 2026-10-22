/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** write_nb.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_nb(prompt_t *variables, system_t *sys)
{
    int print = 0;

    if (variables->status == 0)
        print = dprintf(STDOUT_FILENO, "%s%d%s",
            str_term_caps[GREEN], variables->status, str_term_caps[RESET]);
    else
        print = dprintf(STDOUT_FILENO, "%s%d",
            str_term_caps[RED], variables->status);
    sys->prompt = realloc(sys->prompt,
        sizeof(char) * (print + strlen(sys->prompt) + 1));
    if (sys->prompt == NULL)
        return ERROR;
    if (variables->status == 0)
        sprintf(sys->prompt, "%s%s%d%s", sys->prompt, str_term_caps[GREEN],
            variables->status, str_term_caps[RESET]);
    else
        sprintf(sys->prompt, "%s%s%d%s", sys->prompt, str_term_caps[RED],
            variables->status, str_term_caps[RESET]);
    return SUCCESS;
}
