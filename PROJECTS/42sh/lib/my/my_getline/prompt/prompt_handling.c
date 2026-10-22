/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** prompt_handling.c
*/

#include <string.h>
#include <math.h>
#include <stdio.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"

static void reset_prompt(char *prompt, char *buff)
{
    struct winsize ws = {0};
    char **tab = my_str_to_word_array(prompt, "\n", "");

    if (tab == NULL)
        return;
    if (ioctl(STDIN_FILENO, TIOCGWINSZ, &ws) != 0) {
        free_list(tab);
        return;
    }
    del_line(tab[0], NULL, ws.ws_col);
    dprintf(STDOUT_FILENO, "%s", str_term_caps[M_CURSOR_UP]);
    del_line(tab[1], buff, ws.ws_col);
    dprintf(STDOUT_FILENO, "%s", prompt);
    free_list(tab);
}

void prompt_handling(index_t *ind, char *prompt)
{
    if (ind->buf == NULL)
        ind->buf = calloc(0, 1);
    if (ind->len == 0) {
        ind->buf = malloc(sizeof(char));
        ind->buf[ind->len] = 0;
    }
    if (ind->buf == NULL)
        return;
    reset_prompt(prompt, ind->buf);
    for (int i = 0; i < ind->len; i++)
        write(STDOUT_FILENO, &ind->buf[i], 1);
    for (int k = 0; k < ind->len - ind->index; k++)
        write(STDOUT_FILENO, MOVE_LEFT, 3);
}
