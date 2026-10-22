/*
** EPITECH PROJECT, 2024
** mysh.h
** File description:
** mysh.h
*/

#ifndef SRC_H_
    #define SRC_H_
    #include <stddef.h>
    #include <termios.h>
    #include <stdbool.h>
    #include "linked_list.h"

    /* return values */
    #define EPI_ERROR 84
    #define EPI_SUCCESS 0
    #define COMMAND_ERROR 1
    #define SKIP -1
    #define ENV_ERROR 125
    #define OPEN_ERROR -1

    /* keys values getline */
    #define DEL 127

    /* standard length */
    #define PATH_MAX_LEN 512

    /* architecture magic as int */
    #define ARCHI_MAGIC 1179403647

    /* history */
    #define HIST_BUFF_MAX 1000
    #define HIST_FILE_MAX 2000

    /* other */
    #define STANDARD_INPUT 0

    #define ARRAY_SIZE(array) (unsigned int)(sizeof(array) / sizeof(*array))

    /* job management */
    #define BACKGROUND_JOB "&"
    #define FILE_TO_REDIRECT "./.redirect"
    #define SUSPENDED "Suspended\0"
    #define DONE "Done\0"
    #define DECIMAL_BASE 10

/* jobs part */

typedef struct system_s system_t;

typedef struct jobs_s {
    pid_t pid;
    long int ID;
    char **command_line;
} jobs_t;

linked_list_t *init_jobs(void);
void do_background(system_t *sys, char **command);
void do_fg(system_t *sys, char **command);
void free_jobs(void *data);
void print_jobs(node_t *data);
void do_jobs(system_t *data, char **command);
void fill_jobs_infos(linked_list_t *jobs, pid_t pid,
    char **command);
void kick_out_list(system_t *sys);

typedef struct jobs_functions_s {
    char *key;
    void (*func)(system_t *sys, char **);
} jobs_functions_t;

static const jobs_functions_t func[] = {
    {"&", &do_background},
    {"fg", &do_fg},
    {"jobs", &do_jobs},
    {"\0", NULL}};

/* signals */

typedef struct check_signal_s {
    bool is_ctrl_z;
    bool is_ctrl_c;
} check_signal_t;

typedef struct index_s index_t;

void handle_signal(int sig);
void handle_ctrl_c(int __attribute_maybe_unused__ sig);
struct sigaction create_handler(void (*handler)(int sig));
check_signal_t *is_signal(void);
void do_ctrl_c(pid_t pid, int *status);
void do_ctrl_z(system_t *sys, char **command, pid_t pid, int *status);
int do_kill(char **args, system_t *sys);

/* binary tree */
typedef enum type {
    NONE,
    SEMICOLON,
    PIPE,
    REDIRECTION_L,
    REDIRECTION_LL,
    REDIRECTION_R,
    REDIRECTION_RR,
    AND,
    OR
} type_t;

typedef struct tree_s {
    char **command;
    type_t redirection;
    struct tree_s *left;
    struct tree_s *right;
} tree_t;

typedef struct redirection_s {
    type_t redirection;
    char *string;
    int (*exec_operator)(tree_t *tree, system_t *sys);
    int (*check_error)(tree_t *tree);
    unsigned int priority;
} redirection_t;

typedef struct var_s {
    char *var;
    char *value;
} var_t;

typedef struct alias_var_s {
    char *alias;
    char *cmd;
    bool status;
    bool bracket;
} alias_var_t;

typedef struct history_cmd_s {
    long int line_nb;
    char *cmd;
} history_cmd_t;

typedef struct history_s {
    linked_list_t *history;
    char *hist_file_path;
    int buff_lines_nb;
    int hist_file_nb_lines;
} history_t;

typedef struct system_s {
    linked_list_t *env;
    linked_list_t *var;
    linked_list_t *alias;
    linked_list_t *jobs;
    history_t *history;
    bool has_exited;
    char *prompt;
    char *input;
    char *user;
    char *pathshrc;
} system_t;

/* index structure my_getline */
typedef struct index_s {
    char *buf;
    int len;
    int index;
    int esc;
    struct termios old;
    char exit;
    history_t *history;
    node_t *current_cmd;
} index_t;




void free_tree(tree_t *head);
void my_free_str(char **str);
char *my_revstrndup(char *str, int n);
void prompt_handling(index_t *ind, char *prompt);
void del_line(char *str, char *buff, int nb_col);
int move_up(index_t *ind);
int move_down(index_t *ind);
int move_right(index_t *ind);
int move_left(index_t *ind);
bool is_del(char c);
bool is_new_line(char c);
bool is_esc(char c);
bool is_ctrl_d(char c);
bool is_tab(char c);
void exec_del(index_t *ind);
void exec_new_line(index_t *ind);
void exec_esc(index_t *ind);
void exec_ctrl_d(index_t *ind);
void exec_tab(index_t *ind);
void do_tab(index_t *ind);
void exec_add_letter(index_t *ind, char const c);
void get_arrow(char c, index_t *ind);
index_t *init_getline(history_t *history);
int get_s_char(char c);
void exec_ctrl_l(index_t *ind);
bool is_ctrl_l(char c);

enum arrow {
    UP_ARROW = 'A',
    DOWN_ARROW = 'B',
    RIGHT_ARROW = 'C',
    LEFT_ARROW = 'D',
};

    #define CHAR -1
    #define EOT -1

    #define ESC '\033'
    #define TAB '\t'
    #define CTRLD 4
    #define CTRLL 12
    #define MOVE_RIGHT "\033[C"
    #define MOVE_LEFT "\033[D"
    #define ARRSIZE 5

static int (*const move_func[])(index_t *) = {
    move_up,
    move_down,
    move_right,
    move_left,
};

typedef struct exec_special_char_s {
    bool (*is_special_char)(char c);
    void (*exec_special_char)(index_t *);
} exec_special_char_t;

static const exec_special_char_t special_char_list[] = {
    {is_del, exec_del},
    {is_new_line, exec_new_line},
    {is_esc, exec_esc},
    {is_ctrl_d, exec_ctrl_d},
    {is_tab, exec_tab},
    {is_ctrl_l, exec_ctrl_l},
};

typedef struct script_cmd_s {
    char *cmd;
} script_cmd_t;

/* operators */
int error_redirect(tree_t *branch, const char *error_msg);
int exec_rr_r(tree_t *tree, system_t *sys, int mode);
int exec_pipe(tree_t *tree, system_t *sys);
int exec_r(tree_t *tree, system_t *sys);
int exec_rr(tree_t *tree, system_t *sys);
int exec_l(tree_t *tree, system_t *sys);
int exec_ll(tree_t *tree, system_t *sys);
int exec_or(tree_t *tree, system_t *sys);
int exec_and(tree_t *tree, system_t *sys);
int check_tree(tree_t *tree);
int check_r_rr(tree_t *tree);
int check_pipe_or(tree_t *tree);
int check_and(tree_t *tree);
int check_l(tree_t *tree);
int check_ll(tree_t *tree);

static const redirection_t redirection_list[] = {
    {SEMICOLON, ";", NULL, NULL, 7},
    {OR, "||", &exec_or, &check_pipe_or, 6},
    {AND, "&&", &exec_and, &check_and, 5},
    {REDIRECTION_R, ">", &exec_r, &check_r_rr, 4},
    {REDIRECTION_RR, ">>", &exec_rr, &check_r_rr, 3},
    {REDIRECTION_L, "<", &exec_l, &check_l, 2},
    {REDIRECTION_LL, "<<", &exec_ll, &check_ll, 2},
    {PIPE, "|", &exec_pipe, &check_pipe_or, 1},
};

typedef struct prompt {
    char *params;
    char *user;
    char *hostname;
    int status;
    char ch;
} prompt_t;

int prompt(prompt_t *variables, system_t *sys);
int exec_proper_function(char **args,
    system_t *sys, int return_value);
int mysh(system_t *sys);
int get_input(char **command,
    char ***args, prompt_t *variables, system_t *sys);
int change_or_create(const char *var, char *value, linked_list_t *head);
bool is_env_variable(linked_list_t *env, const char *var);
char *get_env_var(linked_list_t *env, const char *var);
char *which_path(char *command, char *paths);
void command(char **args, system_t *sys,
    char **path, char **env_list);
char *format_cmd(char *command);
int replace_wave(char **arg, linked_list_t *env);
int handle_star(char ***argv);
char *handle_var(char *command, system_t *sys, int *return_value);
int handle_question_mark(char ***argv);

/*system*/

system_t *initialize_system(char **env);
void end_shell(char *command,
    char **args, system_t *sys, prompt_t *variable);
int save_history(history_t *history);

/* built-in */
int do_existing_command(char **args, system_t *sys);
int do_cd(char **args, system_t *sys);
int do_env(char **args, system_t *sys);
int do_setenv(char **args, system_t *sys);
int do_unsetenv(char **args, system_t *sys);
int do_exit(char **args, system_t *sys);
int do_which(char **args, system_t *sys);
int do_where(char **args, system_t *sys);
int do_repeat(char **args, system_t *sys);
int do_foreach(char **args, system_t *sys);
int do_if(char **args, system_t *sys);
int do_ia(system_t *sys, char *input);
int do_ia_setup(char **args, system_t *sys);
linked_list_t *get_env(char **env);
void free_env_var(void *data);
char **env_to_list(linked_list_t *env);
char *create_env_var(char *str);
void free_alias_var(void *data);
alias_var_t *create_alias_var(char *alias, char *cmd, bool bracket);
void add_alias_node(linked_list_t *list, char *alias, char *cmd, bool bracket);
bool sort_alias_var(void *data_first, void *data_second);
void myshrc_cpy(char *path);
linked_list_t *get_alias(linked_list_t *env);
int do_history(char **args, system_t *sys);
int do_alias(char **arg, system_t *sys);
int do_unalias(char **arg, system_t *sys);
void del_alias_node(linked_list_t *alias, char *del);
void check_alias(char ***args, linked_list_t *alias);
void add_to_history(char *command, history_t *history);
int do_history(char **args, system_t *sys);
history_t *get_history(linked_list_t *env);
void free_history_cmd(void *data);
int add_script_cmd_node(linked_list_t *list, char *cmd);
void free_script_cmd(void *data);
void free_var(void *data);
var_t *create_var(char *var, char *value);
int do_set(char **args, system_t *sys);
int do_unset(char **args, system_t *sys);
bool sort_var(void *data_first, void *data_second);
int format_scripting(char ***args, system_t *sys);
int get_condition(char **args, bool *condition, int *ind);

/* execution */
void exec_command_no_fork(char **args, system_t *sys,
    char **path, char **env_list);
int exec_command(char **args, system_t *sys);
void exec_operator_no_fork(tree_t *tree,
    system_t *sys, char **path, char **env_list);
int exec_operator(tree_t *tree, system_t *sys);

/* binary tree */
tree_t *make_tree(char **command);

/* my_getline */
int my_getline(char *prompt, char **buff, size_t *len, history_t *history);

int write_user(prompt_t *variables, system_t *sys);
int write_nb(prompt_t *variables, system_t *sys);
int write_hostname(prompt_t *variables, system_t *sys);
int write_path(prompt_t *variables, system_t *sys);
int write_git(prompt_t *variables, system_t *sys);
int write_time(prompt_t *variables, system_t *sys);
int write_wave(int len, char *wd);
int write_jump_line(prompt_t *variables, system_t *sys);
int write_char(prompt_t *variables, system_t *sys);

typedef struct custom_prompt {
    char c;
    int (*add_feat)(prompt_t *, system_t *);
} custom_prompt_t;

static const custom_prompt_t feat_prompt_tab[] = {
    {'P', write_path},
    {'H', write_hostname},
    {'U', write_user},
    {'R', write_nb},
    {'G', write_git},
    {'T', write_time},
    {'N', write_jump_line},
};

typedef struct exec_command {
    const char *command;
    int (*exec)(char **args, system_t *sys);
} exec_command_t;

static const exec_command_t commands[] = {
    {"cd", &do_cd},
    {"env", &do_env},
    {"setenv", &do_setenv},
    {"unsetenv", &do_unsetenv},
    {"exit", &do_exit},
    {"alias", &do_alias},
    {"unalias", &do_unalias},
    {"history", &do_history},
    {"which", &do_which},
    {"where", &do_where},
    {"repeat", &do_repeat},
    {"foreach", &do_foreach},
    {"jkill", &do_kill},
    {"set", &do_set},
    {"unset", &do_unset},
    {"if", &do_if},
    {"ai-setup", &do_ia_setup},
};

/* letter allowed for fist env variable name */
static const char first_env_char_allowed[] =
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_";

/* letter allowed for env variable name */
static const char env_char_allowed[] =
"1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_.";

#endif
