/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** write_path.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_time(prompt_t __maybe_unused *variables, system_t *sys)
{
    time_t t = {0};
    struct tm* tm = NULL;
    int print = 0;

    time(&t);
    tm = localtime(&t);
    if (tm == NULL)
        return SUCCESS;
    print = dprintf(STDOUT_FILENO, "%s%d:%d:%d%s", str_term_caps[CYAN],
        tm->tm_hour, tm->tm_min, tm->tm_sec, str_term_caps[RESET]);
    sys->prompt = realloc(sys->prompt,
        sizeof(char) * (print + strlen(sys->prompt) + 1));
    sprintf(sys->prompt, "%s%s%d:%d:%d%s", sys->prompt, str_term_caps[CYAN],
        tm->tm_hour, tm->tm_min, tm->tm_sec, str_term_caps[RESET]);
    return SUCCESS;
}
