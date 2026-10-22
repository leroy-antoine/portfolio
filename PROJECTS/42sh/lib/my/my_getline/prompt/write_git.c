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

static int last_slash(char const *str)
{
    int i = strlen(str) + 1;

    while (i > 0) {
        if (str[i] == '/')
            return i;
        --i;
    }
    return 0;
}

static char *get_branch(void)
{
    char *file = open_file(".git/HEAD");
    int len = 0;

    if (file == NULL)
        return "";
    len = strlen(file);
    if (file[len - 1] == '\n')
        file[len - 1] = '\0';
    return file;
}

int write_git(prompt_t __maybe_unused *variables, system_t *sys)
{
    char *branch = get_branch();
    int print = 0;
    int slash_index = last_slash(branch) + 1;

    if (branch[0] != '\0') {
        print = dprintf(STDOUT_FILENO, "%son %s%s", str_term_caps[RED],
            branch + slash_index, str_term_caps[RESET]);
        sys->prompt = realloc(sys->prompt,
            sizeof(char) * (print + strlen(sys->prompt) + 1));
        sprintf(sys->prompt, "%s%son %s%s", sys->prompt, str_term_caps[RED],
            branch + slash_index, str_term_caps[RESET]);
    }
    return SUCCESS;
}
