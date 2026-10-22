/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** write_user.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_user(prompt_t *variables, system_t *sys)
{
    int print = 0;

    if (variables->user == NULL) {
        variables->user = strdup("$ ");
        if (variables->user == NULL)
            return ERROR;
    }
    print = dprintf(STDOUT_FILENO, "%s%s%s%s",
        str_term_caps[RESET], str_term_caps[CYAN],
        variables->user, str_term_caps[RESET]);
    sys->prompt = realloc(sys->prompt,
        sizeof(char) * (print + strlen(sys->prompt) + 1));
    if (sys->prompt == NULL)
        return ERROR;
    sprintf(sys->prompt, "%s%s%s%s%s",
        sys->prompt, str_term_caps[RESET], str_term_caps[CYAN],
        variables->user, str_term_caps[RESET]);
    return SUCCESS;
}
