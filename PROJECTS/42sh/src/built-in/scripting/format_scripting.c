/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** format_scripting
*/

#include "mysh.h"

int format_scripting(char ***args, system_t *sys)
{
    check_alias(args, sys->alias);
    if (*args == NULL)
        return EPI_ERROR;
    if (replace_wave(*args, sys->env) == COMMAND_ERROR ||
        handle_star(args) == EPI_ERROR ||
        handle_question_mark(args) == EPI_ERROR) {
        return COMMAND_ERROR;
    }
    return EPI_SUCCESS;
}
