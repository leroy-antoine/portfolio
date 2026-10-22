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
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

int write_path(prompt_t __maybe_unused *variables, system_t *sys)
{
    char *wd = getcwd(NULL, PATH_MAX_LEN);
    int len = 0;
    char *home = get_env_var(sys->env, "HOME");

    if (home != NULL) {
        len = strlen(home);
        if (strncmp(home, wd, len) == 0)
            wd += len;
        else
            len = 0;
        free(home);
    }
    sys->prompt = malloc(sizeof(char) * write_wave(len, wd));
    if (sys->prompt == NULL)
        return ERROR;
    sprintf(sys->prompt, "%s~%s>", str_term_caps[MAGENTA], wd);
    if (len != 0)
        wd -= len;
    free(wd);
    return SUCCESS;
}
