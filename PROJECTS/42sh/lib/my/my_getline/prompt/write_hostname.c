/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** write_hostname.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_hostname(prompt_t *variables, system_t *sys)
{
    int print = 0;

    if (variables->hostname == NULL)
        return SUCCESS;
    print = dprintf(STDOUT_FILENO, "%s%s%s%s", str_term_caps[BLUE],
            str_term_caps[YELLOW], variables->hostname, str_term_caps[RESET]);
    sys->prompt = realloc(sys->prompt,
        sizeof(char) * (print + strlen(sys->prompt) + 1));
    if (sys->prompt == NULL)
        return ERROR;
    sprintf(sys->prompt, "%s%s%s%s%s", sys->prompt, str_term_caps[BLUE],
            str_term_caps[YELLOW], variables->hostname, str_term_caps[RESET]);
    return SUCCESS;
}
