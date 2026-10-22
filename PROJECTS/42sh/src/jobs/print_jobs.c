/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** print_jobs
*/

#include <stdio.h>
#include <unistd.h>
#include "mysh.h"

static ssize_t get_len(node_t *nodes)
{
    ssize_t size = 1;
    node_t *tmp = nodes;

    while (tmp != NULL && tmp->next != NULL) {
        size += 1;
        tmp = tmp->next;
    }
    return size;
}

static void print_the_jobs(node_t *tmp, ssize_t id_head, pid_t pid_head,
    node_t *data)
{
    char **command_line = NULL;
    ssize_t id_next = 0;

    tmp = data;
    command_line = ((jobs_t *)tmp->next->data)->command_line;
    id_next = ((jobs_t *)tmp->next->data)->ID;
    dprintf(STDOUT_FILENO, "[%ld] %d\n[%ld]  + Suspended (tty output)\t\t",
        id_head, pid_head, id_next);
    for (ssize_t i = 0; command_line[i] != NULL; i++)
        dprintf(STDOUT_FILENO, "%s ", command_line[i]);
    dprintf(STDOUT_FILENO, "\n");
}

void print_jobs(node_t *data)
{
    node_t *tmp = data;
    ssize_t id_head = 0;
    pid_t pid_head = 0;

    if (tmp == NULL)
        return;
    id_head = ((jobs_t *)tmp->data)->ID;
    pid_head = ((jobs_t *)tmp->data)->pid;
    if (get_len(tmp) == 1)
        dprintf(STDOUT_FILENO, "[%ld] %d\n", id_head, pid_head);
    else {
        print_the_jobs(tmp, id_head, pid_head, data);
    }
}
