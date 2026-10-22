/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** prompt.c
*/

#include <ctype.h>
#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

static int parse_args_path(prompt_t *variables, system_t *sys)
{
    for (int i = 0; sys->pathshrc[i] != 0; i++) {
        if(sys->pathshrc[i] == '%') {
            for (int j = 0; j < (int)ARRAY_SIZE(feat_prompt_tab); j++) {
                if (sys->pathshrc[i + 1] == feat_prompt_tab[j].c)
                    feat_prompt_tab[j].add_feat(variables, sys);
            }
            i++;
        } else {
            variables->ch = sys->pathshrc[i];
            write_char(variables, sys);
        }
    }
    return SUCCESS;
}

int prompt(prompt_t *variables, system_t *sys)
{
    if (sys->prompt != NULL)
        free(sys->prompt);
    if (sys->pathshrc == NULL) {
        sys->pathshrc = strdup("%P %U %C%N[%R] %T %H %G> ");
        parse_args_path(variables, sys);
    } else
        parse_args_path(variables, sys);
    return SUCCESS;
}
