/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** do_jobs
*/

#include "mysh.h"
#include <unistd.h>

static void print_job_list(node_t *node)
{
    jobs_t *data = NULL;
    int iteration = 0;

    while (node != NULL) {
        ++iteration;
        data = node->data;
        if (data == NULL)
            continue;
        dprintf(STDOUT_FILENO, "[%ld]\tSuspended (tty output)\t\t", data->ID);
        for (size_t i = 0; data->command_line[i] != NULL; ++i)
            dprintf(STDOUT_FILENO, "%s ", data->command_line[i]);
        dprintf(STDOUT_FILENO, "\n");
        node = node->next;
    }
}

void do_jobs(system_t *sys, char **)
{
    if (sys == NULL || sys->jobs == NULL || sys->jobs->head == NULL ||
        sys->jobs->head->data == NULL) {
        dprintf(STDOUT_FILENO, "There are no jobs running in background.\n");
        return;
    }
    print_job_list(sys->jobs->head);
}
