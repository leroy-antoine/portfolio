/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** save_history
*/

#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <fcntl.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include "linked_list.h"

static int append_to_file(history_t *history, int nb_lines)
{
    int fd = 0;
    node_t *node = NULL;
    history_cmd_t *history_cmd = NULL;

    if (history == NULL || history->hist_file_path == NULL
        || history->history == NULL)
        return EPI_SUCCESS;
    fd = open(history->hist_file_path, O_RDWR | O_APPEND | O_CREAT, 0664);
    node = get_nth_node(history->history, nb_lines - 1, FRM_END);
    if (fd < 0)
        return EPI_ERROR;
    while (node != NULL){
        history_cmd = (history_cmd_t *)node->data;
        write(fd, history_cmd->cmd, strlen(history_cmd->cmd));
        write(fd, "\n", 1);
        node = node->next;
    }
    return EPI_SUCCESS;
}

static int copy_old_to_new_file(FILE *stream, int fd, int nb_lines)
{
    char *line = NULL;
    int i = 0;
    size_t size = 0;
    int start_index = HIST_FILE_MAX - (HIST_FILE_MAX - nb_lines);
    int bytes_read = 0;

    get_to_nth_line(stream, start_index);
    bytes_read = getline(&line, &size, stream);
    while (bytes_read != -1){
        write(fd, line, strlen(line));
        bytes_read = getline(&line, &size, stream);
        i++;
    }
    free(line);
    return EPI_SUCCESS;
}

static int copy_buff_to_new_file(linked_list_t *history, int fd, int nb_lines)
{
    node_t *node = history->head;
    history_cmd_t *history_cmd = NULL;

    node = get_nth_node(history, nb_lines - 1, FRM_END);
    while (node != NULL){
        history_cmd = (history_cmd_t *)node->data;
        write(fd, history_cmd->cmd, strlen(history_cmd->cmd));
        write(fd, "\n", 1);
        node = node->next;
    }
    return EPI_SUCCESS;
}

static int write_to_new_file(history_t *history, int nb_lines)
{
    int fd = 0;
    char *tmp_file = NULL;
    FILE *stream = NULL;

    tmp_file = my_strcat_inf(2, history->hist_file_path, ".tmp");
    if (tmp_file == NULL)
        return EPI_ERROR;
    stream = fopen(history->hist_file_path, "r");
    fd = open(tmp_file, O_RDWR | O_CREAT, 0664);
    if (fd == -1 || stream == NULL)
        return EPI_ERROR;
    copy_old_to_new_file(stream, fd, nb_lines);
    copy_buff_to_new_file(history->history, fd, nb_lines);
    remove(history->hist_file_path);
    rename(tmp_file, history->hist_file_path);
    fclose(stream);
    close(fd);
    free(tmp_file);
    return EPI_SUCCESS;
}

int save_history(history_t *history)
{
    int nb_lines = 0;

    if (history == NULL)
        return EPI_ERROR;
    nb_lines = history->buff_lines_nb;
    if (history->buff_lines_nb + history->hist_file_nb_lines > HIST_FILE_MAX)
        write_to_new_file(history, nb_lines);
    else
        if (append_to_file(history, nb_lines) == EPI_ERROR)
            return EPI_ERROR;
    return EPI_SUCCESS;
}
