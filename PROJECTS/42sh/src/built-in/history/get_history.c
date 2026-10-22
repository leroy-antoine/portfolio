/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_history
*/

#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include "linked_list.h"

static char *get_history_file_path(linked_list_t *env)
{
    char *path = NULL;
    char *home_var = get_env_var(env, str_env[HOME_VAR]);

    if (home_var == NULL)
        return NULL;
    path = my_strcat_inf(2, home_var, (char *)str_env[HISTORY_PATH]);
    if (path == NULL){
        free(home_var);
        return NULL;
    }
    free(home_var);
    return path;
}

static history_cmd_t *create_history_cmd(char const *line, long int *cmd_nb)
{
    history_cmd_t *history_cmd = malloc(sizeof(history_cmd_t));

    if (history_cmd == NULL)
        return NULL;
    history_cmd->cmd = strdup(line);
    if (history_cmd->cmd == NULL)
        return NULL;
    history_cmd->cmd[strlen(history_cmd->cmd) - 1] = '\0';
    (*cmd_nb)++;
    history_cmd->line_nb = *cmd_nb;
    return history_cmd;
}

static int read_file_history(history_t *history, FILE *stream)
{
    char *line = NULL;
    size_t size = 0;
    int bytes_read = 0;
    long int cmd_nb = history->hist_file_nb_lines - HIST_BUFF_MAX;
    history_cmd_t *history_cmd = NULL;

    if (cmd_nb <= 0)
        cmd_nb = 0;
    bytes_read = getline(&line, &size, stream);
    while (bytes_read != -1){
        history_cmd = create_history_cmd(line, &cmd_nb);
        if (history_cmd == NULL)
            return EPI_ERROR;
        push_to_tail(history->history, history_cmd);
        bytes_read = getline(&line, &size, stream);
    }
    free(line);
    return EPI_SUCCESS;
}

static int get_history_list(history_t *history, FILE *stream)
{
    int offset = 0;

    if (history->hist_file_nb_lines > HIST_BUFF_MAX){
        offset = history->hist_file_nb_lines - HIST_BUFF_MAX;
        get_to_nth_line(stream, offset);
    }
    if (read_file_history(history, stream) == EPI_ERROR)
        return EPI_ERROR;
    return EPI_SUCCESS;
}

static void open_previous_history(history_t *history)
{
    FILE *stream = fopen(history->hist_file_path, "r");

    if (stream == NULL)
        return;
    history->hist_file_nb_lines = get_file_lines_nb(stream);
    get_history_list(history, stream);
    fclose(stream);
}

history_t *get_history(linked_list_t *env)
{
    history_t *history = malloc(sizeof(history_t));

    if (history == NULL)
        return NULL;
    history->history = initialize_linked_list();
    history->hist_file_path = get_history_file_path(env);
    history->hist_file_nb_lines = 0;
    history->buff_lines_nb = 0;
    if (history->history == NULL) {
        free(history);
        return NULL;
    }
    if (history->hist_file_path == NULL)
        return history;
    open_previous_history(history);
    return history;
}
