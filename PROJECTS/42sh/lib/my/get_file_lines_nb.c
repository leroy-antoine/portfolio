/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_file_lines_nb
*/

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

long int get_file_lines_nb(FILE *stream)
{
    int lines_nb = 0;
    char *buff = NULL;
    size_t size = 0;
    int bytes_read = 0;

    if (stream == NULL)
        return -1;
    bytes_read = getline(&buff, &size, stream);
    while (bytes_read != -1){
        lines_nb++;
        bytes_read = getline(&buff, &size, stream);
    }
    fseek(stream, 0, SEEK_SET);
    free(buff);
    return lines_nb;
}
