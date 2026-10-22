/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** free_history_cmd
*/

#include "mysh.h"

void free_history_cmd(void *data)
{
    history_cmd_t *history_cmd = (history_cmd_t *)data;

    free(history_cmd->cmd);
    free(history_cmd);
    return;
}
