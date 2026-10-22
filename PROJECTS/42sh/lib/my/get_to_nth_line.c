/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_to_nth_line
*/

#include <stdio.h>
#include <stdlib.h>

void get_to_nth_line(FILE *stream, int n)
{
    char *line = NULL;
    int i = 0;
    size_t size = 0;

    while (i < n && getline(&line, &size, stream) != -1)
        i++;
    free(line);
}
