/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** add_to_history
*/

#include <string.h>
#include "mysh.h"

void add_to_history(char *command, history_t *history)
{
    char *cmd = strdup(command);
    history_cmd_t *history_cmd = malloc(sizeof(history_cmd_t));

    if (cmd == NULL || history_cmd == NULL)
        return;
    if (history->history->tail == NULL)
        history_cmd->line_nb = 0;
    else
        history_cmd->line_nb =
            ((history_cmd_t *)history->history->tail->data)->line_nb + 1;
    if (cmd[strlen(cmd) - 1] == '\n')
        cmd[strlen(cmd) - 1] = '\0';
    history_cmd->cmd = cmd;
    push_to_tail(history->history, history_cmd);
    history->buff_lines_nb++;
    if (history->buff_lines_nb + history->hist_file_nb_lines > HIST_BUFF_MAX)
        delete_node(history->history,
        history->history->head, free_history_cmd);
    return;
}
