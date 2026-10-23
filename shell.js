'use strict';

/* ==========================================================================
   my_shell (42sh) : portage dans le navigateur du vrai 42sh (dossier 42sh/ du dépôt).
   Chaque ligne suit le même chemin que src/parsing/get_input.c :
     format_cmd → handle_var → my_str_to_word_array → check_pare → historique (!!) → alias
     → ~ → * → ? → make_tree (priorités de mysh.h) → check_tree → exec_operator.
   Mêmes builtins (src/built-in), mêmes messages (include/formatsh.h), même prompt
   « %P %U %C%N[%R] %T %H %G> », même complétion Tab (do_tab.c)… et mêmes particularités
   (une ligne contenant $ est ignorée après un statut 1, « && ls » plante, etc.).
   Les fork() sont reproduits : une commande redirigée ou à gauche d'un pipe ne modifie pas le shell.
   Les programmes externes (ls, cat, grep…) sont simulés sur un système de fichiers en mémoire :
   rien n'est exécuté sur une vraie machine.
   ========================================================================== */
(function initShell() {
  const root = document.querySelector('[data-shell]');
  if (!root) return;
  const screen = root.querySelector('.term__screen');
  const form = root.querySelector('.term__form');
  const input = root.querySelector('.term__input');
  const ps = root.querySelector('.term__ps');
  const tryBox = root.querySelector('.term__try');
  if (!screen || !form || !input || !ps) return;

  /* ---------- include/mysh.h, include/formatsh.h ---------- */
  const EPI_ERROR = 84;
  const COMMAND_ERROR = 1;
  const MSG = {
    EXIT: 'exit\n',
    UKN_USER: 'Unknown user: %s.\n',
    NOT_DIR: '%s: Not a directory.\n',
    PERM_DENIED: '%s: Permission denied.\n',
    CD_TOO_MANY: 'cd: Too many arguments.\n',
    NO_FILE_DIR: '%s: No such file or directory.\n',
    SETENV_LETTER: 'setenv: Variable name must begin with a letter.\n',
    SETENV_ALNUM: 'setenv: Variable name must contain alphanumeric characters.\n',
    SETENV_TOO_MANY: 'setenv: Too many arguments.\n',
    UNSETENV_TOO_FEW: 'unsetenv: Too few arguments.\n',
    EXT_SYN: 'exit: Expression Syntax.\n',
    COM_NOT_FOUND: '%s: Command not found.\n',
    FORM_ERROR: '%s: Exec format error. Binary file not executable.\n',
    AMBI_IN: 'Ambiguous input redirect.\n',
    AMBI_OUT: 'Ambiguous output redirect.\n',
    MISS_NAME: 'Missing name for redirect.',
    NULL_COM: 'Invalid null command.',
    UNALIAS: 'unalias: Too few arguments.\n',
    BAD_NUMBER: 'history: Badly formed number.\n',
    HISTORY_TOO_MANY: 'history: Too many arguments.\n',
    WHICH_TOO_FEW: 'which: Too few arguments.\n',
    WHICH_BUILT_IN: '%s: shell built-in command.\n',
    WHERE_TOO_FEW: 'where: Too few arguments.\n',
    WHERE_IS_PATH: 'where: / in command makes no sense\n',
    WHERE_BUILT_IN: '%s is a shell built-in\n',
    REPEAT_BAD_NB: 'repeat: Badly formed number.\n',
    REPEAT_TOO_FEW: 'repeat: Too few arguments.\n',
    FOREACH_TOO_FEW: 'foreach: Too few arguments.\n',
    FOREACH_NOT_PAR: 'foreach: Words not parenthesized.\n',
    FOREACH_NO_END: 'foreach: end not found.\n',
    FOREACH_PROMPT: 'foreach? ',
    NO_MATCH_STAR: '%s: No match.\n',
    END: 'end',
    SET_LETTER: 'set: Variable name must begin with a letter.\n',
    SET_ALNUM: 'set: Variable name must contain alphanumeric characters.\n',
    UNSET_TOO_FEW: 'unset: Too few arguments.\n',
    UND_VAR: '%s: Undefined variable.\n',
    TOO_MANY_CLOSE_PARE: 'Too many )\'s.\n',
    TOO_MANY_OPEN_PARE: 'Too many (\'s.\n',
    IF_TOO_FEW: 'if: Too few arguments.\n',
    IF_SYNTAX: 'if: Expression Syntax.\n',
    IF_EMPTY: 'if: Empty if.\n',
    IF_IMPROPER: 'if: Improper then.\n',
    IF_PROMPT: 'if? ',
    ENDIF: 'endif',
    THEN: 'then',
    THEN_NO_END: 'then: then/endif not found.\n',
    NO_API_SETUP: 'Error: No config file. Please execute the command "ai-setup".\n.',
  };
  const fmt = (message, value) => message.replace('%s', value);
  const DEFAULT_PROMPT = '%P %U %C%N[%R] %T %H %G> ';
  const START_NEW_CMD = ['|', ';', '&&', '||'];
  const FIRST_ENV_CHAR = /^[A-Za-z_]/;
  const ENV_CHARS = /^[0-9A-Za-z_.]*$/;
  const HIST_BUFF_MAX = 1000;

  /* ---------- Système de fichiers en mémoire ---------- */
  const FILES = {
    "Makefile": "CC ?= gcc\n\nPATH_UNI = ./tests/unitest/test_42sh.c\n\nINCLUDE_DIR = include\n\nMAIN = src/main.c\n\nSRC = \t$(addprefix src/, \t\t\t\t\t\t\\\n\t\tmysh.c\t\t\t\t\t\t\t\t\t\\\n\t\t\\\n\t\tbuilt-in/cd/do_cd.c\t\t\t\t\t\t\\\n\t\tbuilt-in/ia/do_ia.c\t\t\t\t\t\t\\\n\t\tbuilt-in/ia/do_ia_setup.c\t\t\t\t\\\n\t\tbuilt-in/exit/do_exit.c\t\t\t\t\t\\\n\t\tbuilt-in/env/do_env.c\t\t\t\t\t\\\n\t\tbuilt-in/env/do_setenv.c\t\t\t\t\\\n\t\tbuilt-in/env/do_unsetenv.c\t\t\t\t\\\n\t\tbuilt-in/env/get_env_var.c\t\t\t\t\\\n\t\tbuilt-in/env/is_env_var.c\t\t\t\t\\\n\t\tbuilt-in/env/get_env.c\t\t\t\t\t\\\n\t\tbuilt-in/env/free_env_var.c \t\t\t\\\n\t\tbuilt-in/env/env_to_list.c \t\t\t\t\\\n\t\tbuilt-in/env/create_env_var.c \t\t\t\\\n\t\tbuilt-in/alias/create_alias_var.c \t\t\\\n\t\tbuilt-in/alias/free_alias_var.c \t\t\\\n\t\tbuilt-in/alias/sort_alias_var.c \t\t\\\n\t\tbuilt-in/alias/copy_myshrc.c\t\t\t\\\n\t\tbuilt-in/alias/get_alias.c\t\t\t\t\\\n\t\t\\\n\t\tsystem/initialize_system.c \t\t\t\t\\\n\t\tsystem/end_shell.c\t\t\t\t\t\t\\\n\t\t\\\n\t\tbuilt-in/alias/do_alias.c\t\t\t\t\\\n\t\tbuilt-in/alias/do_unalias.c\t\t\t\t\\\n\t\tbuilt-in/alias/del_alias_var.c\t\t\t\\\n\t\tbuilt-in/alias/check_alias.c\t\t\t\\\n\t\tbuilt-in/history/add_to_history.c \t\t\\\n\t\tbuilt-in/history/do_history.c \t\t\t\\\n\t\tbuilt-in/history/get_history.c \t\t\t\\\n\t\tbuilt-in/history/save_history.c \t\t\\\n\t\tbuilt-in/history/free_history_cmd.c \t\\\n\t\tbuilt-in/scripting/do_which.c \t\t\t\\\n\t\tbuilt-in/scripting/do_where.c \t\t\t\\\n\t\tbuilt-in/scripting/do_repeat.c \t\t\t\\\n\t\tbuilt-in/scripting/do_foreach.c \t\t\\\n\t\tbuilt-in/scripting/do_if.c \t\t\t\t\\\n\t\tbuilt-in/scripting/get_condition.c \t\t\\\n\t\tbuilt-in/scripting/format_scripting.c \t\\\n\t\tbuilt-in/scripting/create_script_cmd.c\t\\\n\t\tbuilt-in/scripting/free_script_cmd.c\t\\\n\t\tbuilt-in/variables/create_var.c\t\t\t\\\n\t\tbuilt-in/variables/free_var.c\t\t\t\\\n\t\tbuilt-in/variables/do_set.c\t\t\t\t\\\n\t\tbuilt-in/variables/do_unset.c\t\t\t\\\n\t\tbuilt-in/variables/sort_var.c\t\t\t\\\n\t\t\\\n\t\tparsing/which_path.c\t\t\t\t\t\\\n\t\tparsing/make_tree.c\t\t\t\t\t\t\\\n\t\tparsing/get_input.c\t\t\t\t\t\t\\\n\t\tparsing/check_tree.c\t\t\t\t\t\\\n\t\tparsing/check_operators.c\t\t\t\t\\\n\t\tparsing/format_cmd.c\t\t\t\t\t\\\n\t\tparsing/wave.c \t                    \t\\\n\t\tparsing/star.c \t                    \t\\\n\t\tparsing/question_mark.c \t        \t\\\n\t\tparsing/prompt.c \t                \t\\\n\t\tparsing/var.c \t                \t\t\\\n\t\tparsing/free_tree.c \t\t\t\t\t\\\n\t\t\\\n\t\toperators/exec_rr_r.c\t\t\t\t\t\\\n\t\toperators/error_branch.c\t\t\t\t\\\n\t\toperators/exec_pipe.c\t\t\t\t\t\\\n\t\toperators/exec_r.c\t\t\t\t\t\t\\\n\t\toperators/exec_rr.c\t\t\t\t\t\t\\\n\t\toperators/exec_l.c\t\t\t\t\t\t\\\n\t\toperators/exec_ll.c\t\t\t\t\t\t\\\n\t\toperators/exec_and.c\t\t\t\t\t\\\n\t\toperators/exec_or.c\t\t\t\t\t\t\\\n\t\t\\\n\t\texecution/do_existing_command.c\t\t\t\\\n\t\texecution/exec_proper_function.c\t\t\\\n\t\texecution/exec_command_no_fork.c\t\t\\\n\t\texecution/exec_command.c\t\t\t\t\\\n\t\texecution/exec_operator.c\t\t\t\t\\\n\t\t\\\n\t\tjobs/do_background.c\t\t\t\t\t\\\n\t\tjobs/do_fg.c\t\t\t\t\t\t\t\\\n\t\tjobs/init_jobs.c\t\t\t\t\t\t\\\n\t\tjobs/free_jobs.c\t\t\t\t\t\t\\\n\t\tjobs/print_jobs.c\t\t\t\t\t\t\\\n\t\tjobs/do_jobs.c\t\t\t\t\t\t\t\\\n\t\t\\\n\t\tsignals//handle_signals.c\t\t\t\t\\\n\t\tsignals/do_ctrl_z.c\t\t\t\t\t\t\\\n\t\tsignals/create_handler.c\t\t\t\t\\\n\t\tsignals/is_signal.c\t\t\t\t\t\t\\\n\t\tsignals/do_kill.c\t\t\t\t\t\t\\\n\t\tsignals/handle_ctrl_c.c\t\t\t\t\t\\\n\t\tsignals/do_ctrl_c.c\t\t\t\t\t\t\\\n    )\n\nOBJ = $(SRC:.c=.o) $(MAIN:.c=.o)\n\nTESTS = tests_run\n\nCFLAGS = -Wall -Wextra\n\nCPPFLAGS = -iquote include\n\nLDFLAGS = -L lib/linked_list -L lib/my\n\nLDLIBS =  -llinked_list -lmy -lm -ljson-c\n\nNAME = 42sh\n\nall:\t$(NAME)\n\n$(NAME):\t$(OBJ)\n\tmake -C lib/my/\n\tmake -C lib/linked_list/\n\t$(CC) -o $(NAME) $(OBJ) $(LDLIBS) $(LDFLAGS)\n\ndebug: CFLAGS += -g3\ndebug: fclean $(OBJ)\n\tmake -C lib/my/ CFLAGS+=-g3\n\tmake -C lib/linked_list/ CFLAGS+=-g3\n\t$(CC) -o $(NAME) $(OBJ) $(LDLIBS) $(LDFLAGS)\n\n$(TESTS): LDFLAGS += --coverage -lcriterion\n$(TESTS):\n\tmake -C lib/my/\n\tmake -C lib/linked_list/\n\t$(CC) -o $(TESTS) $(SRC) $(PATH_UNI) \\\n\t\t$(LDLIBS) $(CPPFLAGS) $(LDFLAGS)\n\t./$(TESTS)\n\nuni_clean:\n\t$(RM) $(TESTS)*\n\nclean:\n\tmake -C lib/my/ clean\n\tmake -C lib/linked_list/ clean\n\t$(RM) $(OBJ)\n\nfclean:\tclean uni_clean\n\t$(RM) *.html coverage coverage.css\n\tmake -C lib/my/ fclean\n\tmake -C lib/linked_list/ fclean\n\t$(RM) $(NAME)\n\nre: fclean all\n\ntests:\n\t./tests/cmp.sh\n\ntester: re\n\t./tests/test.sh\n\ninstall:\n\tsudo apt install libjson-c-dev\n\tmake\n\tsudo cp 42sh /bin\n\tsudo chmod u+x,g+x /bin/42sh\n\tsudo cp 42sh /usr/bin\n\tsudo chmod u+x,g+x /usr/bin/42sh\n\nupdate: re\n\tsudo cp 42sh /bin\n\tsudo chmod u+x,g+x /bin/42sh\n\tsudo cp 42sh /usr/bin\n\tsudo chmod u+x,g+x /usr/bin/42sh\n\n.PHONY: all debug clean fclean re tests tester uni_clean\n",
    "README.md": "my_shell\n\nmy_shell is a simple TCSH-like shell implementation. This project aims to replicate TCSH shell functionalities such as executing commands, handling input/output, and managing processes.\n\nFeatures :\n\n    Command execution with basic shell commands.\n\n    Pipes, semicolon and redirections (< << > ; |)\n\n    Basic shell environment with built-in exit handling.\n\nInstallation\n\nTo get started with my_shell, follow the steps below: Prerequisites\n\nMake sure you have the following installed:\n\n    Git\n\n    Make\n\n    A C compiler (e.g., GCC)\n\nSetup Instructions\n\nClone the repository:\n\n    git clone git@github.com:leroy-antoine/my_shell.git\n\nNavigate to the project directory:\n\n    cd my_shell\n\nBuild the project:\n\n/!\\ Firstly, run:\n\n    make install\n\nTo build the shell, simply run:\n\n    make\n\nIf you want to force rebuild the project (in case of changes), you can use:\n\n    make re\n\nRun my_shell:\n\nAfter the build process is complete, run the shell with:\n\n    ./42sh\n\nTo exit the shell: You can exit the shell by typing:\n\n    exit\n\n    Alternatively, you can press CTRL + D.\n\nCleanup\n\nAfter using the shell, don't forget to clean up your build files. You can do this by running:\n\n    make clean\n\nOr to remove all generated files (including the executable):\n\n    make fclean\n\nContributing\n\nFeel free to open issues, submit pull requests, or improve the documentation! All contributions are welcome.\n",
    "src/main.c": "#include <stdio.h>\n#include <unistd.h>\n\n#include \"mysh.h\"\n#include \"my.h\"\n\nint main(int const argc,\n    char const __attribute_maybe_unused__ **argv, char **env)\n{\n    system_t *system = initialize_system(env);\n\n    if (argc != 1 || system == NULL)\n        return EPI_ERROR;\n    return mysh(system);\n}\n",
    "src/mysh.c": "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <string.h>\n#include \"mysh.h\"\n#include <signal.h>\n#include \"my.h\"\n#include \"formatsh.h\"\n#include \"linked_list.h\"\n\nstatic int change_old_pwd(linked_list_t *env)\n{\n    char *path = get_env_var(env, str_env[OLDPWD_VAR]);\n\n    if (path == NULL)\n        return EPI_SUCCESS;\n    free(path);\n    if (change_or_create(str_env[OLDPWD_VAR], NULL, env) == EPI_ERROR)\n        return EPI_ERROR;\n    return EPI_SUCCESS;\n}\n\nvoid init_prompt(prompt_t *variable, system_t *sys)\n{\n    int len = 0;\n\n    variable->user = get_env_var(sys->env, str_env[USER_VAR]);\n    sys->user = variable->user;\n    variable->hostname = open_file(str_env[HOSTNAME]);\n    if (variable->hostname != NULL) {\n        len = strlen(variable->hostname);\n        if (variable->hostname[len - 1] == '\\n')\n            variable->hostname[len - 1] = '\\0';\n    }\n    variable->status = 0;\n}\n\nvoid shell_loop(char *command, char **args, prompt_t *variables, system_t *sys)\n{\n    int status = EPI_SUCCESS;\n\n    while (status != EPI_ERROR) {\n        status = get_input(&command, &args, variables, sys);\n        if (status == EPI_ERROR)\n            break;\n        if (status == COMMAND_ERROR) {\n            variables->status = COMMAND_ERROR;\n            continue;\n        }\n        variables->status = exec_proper_function(dup_list(args),\n            sys, variables->status);\n        free(sys->input);\n        free_list(args);\n        args = NULL;\n        if (sys->has_exited == true)\n            break;\n        if (status == EOF)\n            break;\n    }\n}\n\nint mysh(system_t *sys)\n{\n    char *command = NULL;\n    char **args = NULL;\n    prompt_t variables = {NULL};\n\n    init_prompt(&variables, sys);\n    if (sys->env == NULL || change_old_pwd(sys->env) == EPI_ERROR)\n        return EPI_ERROR;\n    shell_loop(command, args, &variables, sys);\n    end_shell(command, args, sys, &variables);\n    return variables.status;\n}\n",
    "src/parsing/make_tree.c": "#include <stdlib.h>\n#include <string.h>\n#include \"mysh.h\"\n#include \"my.h\"\n#include \"formatsh.h\"\n\nstatic void change_type(char **command,\n    size_t i, redirection_t *redirection)\n{\n    for (size_t j = 0; j < ARRAY_SIZE(redirection_list); j++)\n        if (redirection_list[j].priority > redirection->priority\n            && strcmp(command[i], redirection_list[j].string) == 0\n            && is_between_list(command, i, str_management[OPEN_PARE],\n            str_management[CLOSE_PARE]) == false)\n            *redirection = redirection_list[j];\n}\n\nstatic type_t get_type(char **command)\n{\n    redirection_t redirection = {0};\n\n    for (size_t i = 0; command[i] != NULL; i++)\n        change_type(command, i, &redirection);\n    return redirection.redirection;\n}\n\nstatic int is_delim(char **command, type_t redir, int index)\n{\n    for (int i = 0; command[i] != NULL; i++)\n        if (redirection_list[index].redirection == redir &&\n            strcmp(command[i], redirection_list[index].string) == 0\n            && is_between_list(command, i, str_management[OPEN_PARE],\n            str_management[CLOSE_PARE]) == false)\n            return i;\n    return -1;\n}\n\nstatic int find_delim_index(char **command, type_t redir)\n{\n    int index = 0;\n\n    for (size_t i = 0; i < ARRAY_SIZE(redirection_list); i++) {\n        index = is_delim(command, redir, i);\n        if (index != -1)\n            return index;\n    }\n    return 0;\n}\n\ntree_t *make_tree(char **command)\n{\n    tree_t *head = malloc(sizeof(tree_t));\n    int index = 0;\n\n    if (head == NULL)\n        return NULL;\n    if (command == NULL) {\n        free(head);\n        return NULL;\n    }\n    head->command = command;\n    head->left = NULL;\n    head->right = NULL;\n    head->redirection = get_type(head->command);\n    if (head->redirection == NONE)\n        return head;\n    index = find_delim_index(command, head->redirection);\n    head->left = make_tree(dup_list_ij(command, 0, index));\n    head->right =\n        make_tree(dup_list_ij(command, index + 1, my_list_len(command)));\n    return head;\n}\n"
  };
  const BOOT = new Date();
  const ELF = '\x7fELF\x02\x01\x01';
  const node = (type, extra) => ({ type, mode: type === 'dir' ? 0o775 : 0o664, owner: 'visiteur', mtime: BOOT, ...extra });
  const dir = (children = {}, extra) => node('dir', { children, ...extra });
  const file = (content, extra) => node('file', { content, ...extra });
  const PROGRAM_NAMES = ['ls', 'cat', 'echo', 'pwd', 'grep', 'wc', 'head', 'tail', 'sort', 'uniq', 'tr', 'seq', 'rev', 'mkdir', 'rmdir', 'touch', 'rm', 'cp', 'mv', 'whoami', 'hostname', 'date', 'uname', 'sleep', 'basename', 'dirname', 'true', 'false', 'clear'];
  const binDir = () => dir(Object.fromEntries(PROGRAM_NAMES.map((name) => [name, file(`${ELF}${name}\n`, { prog: name, mode: 0o755, owner: 'root' })])), { mode: 0o755, owner: 'root' });
  const sources = (paths) => {
    const tree = {};
    paths.forEach((path) => {
      const parts = path.split('/');
      let cur = tree;
      parts.slice(0, -1).forEach((part) => { cur[part] = cur[part] || dir(); cur = cur[part].children; });
      cur[parts[parts.length - 1]] = file(FILES[path]);
    });
    return tree;
  };
  const HELP = `Émulation de 42sh dans le navigateur
====================================
Portage fidèle du vrai 42sh (C) : mêmes builtins, mêmes messages d'erreur,
mêmes priorités d'opérateurs... et mêmes particularités.

Builtins    : cd env setenv unsetenv exit alias unalias history which where
              repeat foreach if set unset jobs fg jkill
Opérateurs  : ;  &&  ||  |  >  >>  <  <<  &  (une commande suivie de & part en tâche de fond)
Expansions  : $VAR  $?  ~  ~utilisateur  *  ?  !!
Programmes  : ${PROGRAM_NAMES.join(' ')}
Raccourcis  : Tab (complétion), flèches haut et bas (historique), Ctrl+L (effacer),
              Ctrl+D (quitter), Ctrl+C (interrompre)

Exemples :
  foreach p (Zappy Arcade)    puis    echo $p    puis    end
  if ( 2 > 1 ) echo vrai
  sleep 3 &    puis    jobs    puis    fg
  alias          (alias chargés depuis ~/.myshrc)
`;
  let fsRoot;
  function makeFs() {
    fsRoot = dir({
      bin: binDir(),
      usr: dir({ bin: binDir() }, { mode: 0o755, owner: 'root' }),
      etc: dir({
        hostname: file('portfolio\n', { owner: 'root', mode: 0o644 }),
        passwd: file('root:x:0:0:root:/root:/bin/bash\nvisiteur:x:1000:1000:Visiteur:/home/visiteur:/bin/42sh\n', { owner: 'root', mode: 0o644 }),
      }, { mode: 0o755, owner: 'root' }),
      tmp: dir({}, { mode: 0o777, owner: 'root' }),
      home: dir({
        visiteur: dir({
          '.myshrc': file("# ~/.myshrc\n\n# some ls aliases\nalias ll 'ls -alF'\nalias la 'ls -A'\nalias l 'ls -CF'\n\n# coding-style checker\nalias co 'coding-style . . && cat coding-style-reports.log && rm -rf coding-style-reports.log'\n"),
          'aide.txt': file(HELP),
          'notes.txt': file('Lunar Lander\nZappy\nRaytracer\nDoctor Cvrie\nArcade\nmy_shell\n'),
          my_shell: dir({
            '.git': dir({ HEAD: file('ref: refs/heads/main\n') }),
            ...sources(['Makefile', 'README.md', 'src/main.c', 'src/mysh.c', 'src/parsing/make_tree.c']),
          }),
        }),
      }, { mode: 0o755, owner: 'root' }),
    }, { mode: 0o755, owner: 'root' });
  }

  let cwd = '/home/visiteur';
  const normalize = (path) => {
    const parts = [];
    path.split('/').forEach((part) => {
      if (!part || part === '.') return;
      if (part === '..') parts.pop();
      else parts.push(part);
    });
    return `/${parts.join('/')}`;
  };
  const resolve = (path) => normalize(path.startsWith('/') ? path : `${cwd}/${path}`);
  function lookup(path) {
    if (path === '') return null;
    let cur = fsRoot;
    for (const part of resolve(path).split('/').filter(Boolean)) {
      if (cur.type !== 'dir' || !Object.prototype.hasOwnProperty.call(cur.children, part)) return null;
      cur = cur.children[part];
    }
    return cur;
  }
  const parentOf = (path) => {
    const abs = resolve(path);
    const name = abs.split('/').filter(Boolean).pop();
    return { parent: lookup(normalize(`${abs}/..`)), name };
  };
  const isFile = (path) => { const n = lookup(path); return !!n && n.type === 'file'; };
  // open(path, O_WRONLY | O_CREAT [| O_TRUNC | O_APPEND]) : le nœud ouvert, ou le message de strerror.
  function openWrite(path, append) {
    const existing = lookup(path);
    if (existing) {
      if (existing.type === 'dir') return 'Is a directory';
      if (!append) existing.content = '';
      existing.mtime = new Date();
      return existing;
    }
    const { parent, name } = parentOf(path);
    if (!parent || !name) return 'No such file or directory';
    if (parent.type !== 'dir') return 'Not a directory';
    parent.children[name] = file('', { mtime: new Date() });
    return parent.children[name];
  }

  // glob(3) : *, ? et [...], fichiers cachés seulement si le motif commence par un point.
  const segmentRe = (segment) => {
    let re = '';
    for (let i = 0; i < segment.length; i++) {
      const c = segment[i];
      if (c === '*') re += '.*';
      else if (c === '?') re += '.';
      else if (c === '[' && segment.indexOf(']', i + 2) > 0) {
        const end = segment.indexOf(']', i + 2);
        let body = segment.slice(i + 1, end);
        if (body[0] === '!') body = `^${body.slice(1)}`;
        re += `[${body.replace(/\\/g, '\\\\')}]`;
        i = end;
      } else re += c.replace(/[.+^${}()|\\/]/g, '\\$&');
    }
    return new RegExp(`^${re}$`);
  };
  const byteCompare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  function glob(pattern, mark) {
    const absolute = pattern.startsWith('/');
    const segments = pattern.split('/').filter((s, i, all) => s !== '' || i === all.length - 1);
    let results = [{ path: absolute ? '/' : '', node: absolute ? fsRoot : lookup('.') }];
    segments.forEach((segment, index) => {
      const last = index === segments.length - 1;
      const next = [];
      results.forEach(({ path, node: cur }) => {
        if (!cur || cur.type !== 'dir') return;
        const join = (name) => (path === '' ? name : path.endsWith('/') ? path + name : `${path}/${name}`);
        if (segment === '') { next.push({ path: `${path}/`.replace(/\/+$/, '/'), node: cur }); return; }
        if (/[*?[]/.test(segment)) {
          const re = segmentRe(segment);
          const names = ['.', '..', ...Object.keys(cur.children)].filter((n) => (n[0] !== '.' || segment[0] === '.') && re.test(n));
          names.forEach((n) => next.push({ path: join(n), node: n === '.' ? cur : n === '..' ? lookup(normalize(`${resolve(path || '.')}/..`)) : cur.children[n] }));
        } else if (segment === '.' || segment === '..') {
          next.push({ path: join(segment), node: segment === '.' ? cur : lookup(normalize(`${resolve(path || '.')}/..`)) });
        } else if (Object.prototype.hasOwnProperty.call(cur.children, segment) && (last || cur.children[segment].type === 'dir')) {
          next.push({ path: join(segment), node: cur.children[segment] });
        }
      });
      results = next;
    });
    return results.filter((r) => r.node).map((r) => (mark && r.node.type === 'dir' && !r.path.endsWith('/') ? `${r.path}/` : r.path)).sort(byteCompare);
  }

  /* ---------- Terminal ---------- */
  function write(text, cls) {
    if (!text) return;
    const clear = text.lastIndexOf('\x1b[2J');
    if (clear >= 0) {
      screen.replaceChildren();
      text = text.slice(clear + 4).replace(/^\x1b\[3J/, '');
      if (!text) return;
    }
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    screen.append(span);
    scrollDown();
  }
  const scrollDown = () => { screen.scrollTop = screen.scrollHeight; };
  const term = { stdin: null, tty: true, out: (t) => write(t, 'term__out'), err: (t) => write(t, 'term__err') };
  const termErr = term.err;
  const note = (text) => write(`${text}\n`, 'term__welcome');

  let cols = 0;
  function termCols() {
    if (!cols) {
      const probe = document.createElement('span');
      probe.textContent = '0'.repeat(20);
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
      screen.append(probe);
      const w = probe.getBoundingClientRect().width / 20;
      probe.remove();
      const style = getComputedStyle(screen);
      const inner = screen.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      cols = w > 0 ? Math.max(20, Math.floor(inner / w)) : 80;
    }
    return cols;
  }
  window.addEventListener('resize', () => { cols = 0; });

  /* ---------- Lecture d'une ligne (my_getline, ou getline pour <<, foreach, if) ---------- */
  const queue = [];      // lignes tapées en avance ou envoyées par les exemples
  let pending = null;    // { resolve, parts, main }
  let interrupted = false;
  let running = false;
  let idleHooks = [];
  function renderParts(parts, target) {
    parts.forEach(([text, cls]) => {
      if (!cls) { target.append(text); return; }
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = text;
      target.append(span);
    });
  }
  function showPrompt(parts) {
    ps.replaceChildren();
    if (!parts.length) return;
    const flat = [];
    parts.forEach(([text, cls]) => {
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        if (i > 0) flat.push(['\n', null]);
        if (line) flat.push([line, cls]);
      });
    });
    const breakAt = flat.findIndex(([t]) => t === '\n');
    const l1 = document.createElement('span');
    const l2 = document.createElement('span');
    l1.className = 'term__ps-l1';
    l2.className = 'term__ps-l2';
    if (breakAt >= 0) {
      renderParts(flat.slice(0, breakAt), l1);
      renderParts(flat.slice(breakAt + 1).filter(([t]) => t !== '\n'), l2);
      ps.append(l1, l2);
    } else {
      renderParts(flat, l2);
      ps.append(l2);
    }
  }
  function echoLine(parts, text, suffix = '\n') {
    const span = document.createElement('span');
    span.className = 'term__cmd';
    renderParts(parts, span);
    span.append(text + suffix);
    screen.append(span);
    scrollDown();
  }
  function readLine(parts = [], main = false) {
    return new Promise((resolveLine) => {
      pending = { resolve: resolveLine, parts, main, history: null };
      showPrompt(parts);
      input.value = '';
      if (!queue.length && main) idleHooks.splice(0).forEach((hook) => hook());
      pump();
    });
  }
  function deliver(line, shown) {
    const p = pending;
    pending = null;
    ps.replaceChildren();
    echoLine(p.parts, shown === undefined ? (line ?? '') : shown);
    p.resolve(line);
  }
  function pump() {
    if (pending && queue.length) deliver(queue.shift());
  }
  const wait = (ms) => new Promise((done) => {
    const end = Date.now() + ms;
    const tick = () => (interrupted || Date.now() >= end ? done() : setTimeout(tick, Math.min(50, end - Date.now())));
    tick();
  });
  // Entrée standard d'un programme : un texte (pipe, fichier, <<) ou le terminal jusqu'à Ctrl+D.
  async function readAll(io) {
    if (io.stdin !== null) return io.stdin;
    let text = '';
    for (;;) {
      const line = await readLine();
      if (line === null) return text;
      text += `${line}\n`;
    }
  }

  /* ---------- État du shell (system_t) ---------- */
  let sys;
  let status = 0;
  let jobId = 0;
  let pid = 4200;
  const getEnvVar = (name) => {
    const line = sys.env.find((l) => l.startsWith(`${name}=`));
    return line === undefined ? null : line.slice(name.length + 1);
  };
  const isEnvVariable = (name) => sys.env.some((l) => l.split('=')[0] === name);
  function changeOrCreate(name, value) {
    const line = `${name}=${value ?? ''}`;
    const i = sys.env.findIndex((l) => l.split('=')[0] === name);
    if (i >= 0) sys.env[i] = line;
    else sys.env.push(line);
  }
  // fork() : l'enfant travaille sur une copie de l'état du shell (le système de fichiers est partagé).
  class Segfault extends Error {}
  async function inChild(run) {
    const saved = {
      env: [...sys.env], vars: sys.vars.map((v) => ({ ...v })), alias: sys.alias.map((a) => ({ ...a })),
      jobs: [...sys.jobs], hasExited: sys.hasExited, cwd, jobId,
    };
    try {
      return await run();
    } catch (e) {
      if (e instanceof Segfault) return 139;
      throw e;
    } finally {
      Object.assign(sys, { env: saved.env, vars: saved.vars, alias: saved.alias, jobs: saved.jobs, hasExited: saved.hasExited });
      cwd = saved.cwd;
      jobId = saved.jobId;
    }
  }

  function initializeSystem() {
    sys = {
      env: ['USER=visiteur', 'HOME=/home/visiteur', 'PATH=/usr/bin:/bin', 'PWD=/home/visiteur', 'TERM=xterm-256color'],
      vars: [], alias: [], jobs: [], hasExited: false,
      history: { list: [], buff: 0, fileLines: 0 },
      user: null, hostname: null, pathshrc: null,
    };
    cwd = '/home/visiteur';
    status = 0;
    const home = getEnvVar('HOME');
    // get_alias.c : lignes « alias nom 'commande' » de ~/.myshrc
    const rc = home !== null ? lookup(`${home}/.myshrc`) : null;
    if (rc && rc.type === 'file') {
      const lines = rc.content.split('\n').filter(Boolean);
      lines.forEach((line) => {
        if (!line.startsWith('alias ')) return;
        const m = /^ *([^ ]+) '?([^']*)/.exec(line.slice(6));
        if (m && m[2]) sys.alias.push({ alias: m[1], cmd: m[2], bracket: false, status: true });
      });
      // initialize_system.c : un commentaire « # prompt » suivi du format du prompt
      lines.forEach((line, i) => {
        if (line[0] === '#' && line.split(/[ \t]+/)[1] === 'prompt' && lines[i + 1] !== undefined) sys.pathshrc = sys.pathshrc ?? lines[i + 1];
      });
      sys.alias.sort((a, b) => byteCompare(a.alias, b.alias));
    }
    // get_history.c : ~/.mysh_history, numéroté à partir de 1
    const hist = home !== null ? lookup(`${home}/.mysh_history`) : null;
    if (hist && hist.type === 'file') {
      const lines = hist.content.split('\n');
      lines.pop();
      sys.history.fileLines = lines.length;
      let n = Math.max(0, lines.length - HIST_BUFF_MAX);
      lines.slice(-HIST_BUFF_MAX).forEach((cmd) => sys.history.list.push({ n: ++n, cmd }));
    }
    sys.user = getEnvVar('USER');
    const host = lookup('/etc/hostname');
    sys.hostname = host ? host.content.replace(/\n$/, '') : null;
  }

  function endShell() {
    if (!sys.hasExited) term.out(MSG.EXIT);
    // save_history.c : ajoute les commandes de la session à ~/.mysh_history
    const home = getEnvVar('HOME');
    if (home === null || !sys.history.buff) return;
    const f = openWrite(`${home}/.mysh_history`, true);
    if (typeof f !== 'string') f.content += sys.history.list.slice(-sys.history.buff).map((h) => `${h.cmd}\n`).join('');
  }

  /* ---------- Prompt (src/parsing/prompt.c, lib/my/my_getline/prompt) ---------- */
  function promptParts() {
    const parts = [];
    const format = sys.pathshrc ?? DEFAULT_PROMPT;
    for (let i = 0; i < format.length; i++) {
      if (format[i] !== '%') { parts.push([format[i], null]); continue; }
      const c = format[++i];
      if (c === 'P') {
        const home = getEnvVar('HOME');
        const wd = home !== null && cwd.startsWith(home) ? cwd.slice(home.length) : cwd;
        parts.push([`~${wd}>`, 'term__ps-path']);
      } else if (c === 'U') parts.push([sys.user ?? '$ ', 'term__ps-user']);
      else if (c === 'N') parts.push(['\n', null]);
      else if (c === 'R') parts.push([String(status), status === 0 ? 'term__ps-ok' : 'term__ps-ko']);
      else if (c === 'T') {
        const d = new Date();
        parts.push([`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`, 'term__ps-time']);
      } else if (c === 'H' && sys.hostname !== null) parts.push([sys.hostname, 'term__ps-host']);
      else if (c === 'G') {
        const head = lookup('.git/HEAD');
        if (head && head.type === 'file') {
          const branch = head.content.replace(/\n$/, '');
          parts.push([`on ${branch.slice(branch.lastIndexOf('/') + 1)}`, 'term__ps-git']);
        }
      }
    }
    // Les espaces voisins fusionnent avec le texte : le rendu reste celui d'un terminal.
    return parts.reduce((acc, part) => {
      const prev = acc[acc.length - 1];
      if (prev && !prev[1] && !part[1]) prev[0] += part[0];
      else acc.push([...part]);
      return acc;
    }, []);
  }

  /* ---------- Analyse de la ligne ---------- */
  // lib/my/is_between_str.c
  function isBetweenStr(str, ind, prev, next) {
    const equal = prev === next;
    let value = -1;
    let count = 0;
    let found = -1;
    for (let i = ind - 1; i >= 0; i--) {
      if (str[i] === prev && !equal) { found = i; break; }
      if (str[i] === prev && equal) {
        count++;
        if (count === 1) value = i;
      }
    }
    if (!equal) value = found;
    else if (count % 2 === 0) value = -1;
    if (value === -1) return -1;
    let after = 0;
    for (let i = ind + 1; i < str.length; i++) {
      if (str[i] === next && !equal) return value;
      if (str[i] === next && equal) after++;
    }
    if (!equal || after % 2 === 0) return -1;
    return value;
  }
  // lib/my/array.c : is_between_list
  const isBetweenList = (tab, ind) => tab.slice(0, ind).includes('(') && tab.slice(ind + 1).includes(')');

  // src/parsing/format_cmd.c : espaces autour des opérateurs collés (hors parenthèses)
  function isDelim(s, i) {
    if ((i > 0 && s[i - 1] !== ' ') || (i + 1 < s.length && s[i + 1] !== ' ')) {
      if (s[i] === ';') return 1;
      if ('<>|&'.includes(s[i]) && s[i + 1] === s[i]) return 2;
      if ('<>|()'.includes(s[i])) return 1;
    }
    return 0;
  }
  function formatCmd(s) {
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const between = isBetweenStr(s, i, '(', ')');
      const delim = isDelim(s, i);
      if (delim === 1 && between === -1) out += ` ${s[i]} `;
      else if (delim === 2 && between === -1) { out += ` ${s[i]}${s[i + 1]} `; i++; }
      else out += s[i];
    }
    return out;
  }

  // src/parsing/var.c
  function checkChange(command, ind, prevValue, prevQuote, depth = 0) {
    if (depth > 16) return prevValue;
    if (prevQuote === '' || prevQuote !== '"') {
      const value = isBetweenStr(command, ind, '"', '"');
      if (value !== -1) return checkChange(command, value, 0, '"', depth + 1);
    }
    if (prevQuote === '' || prevQuote !== '\'') {
      const value = isBetweenStr(command, ind, '\'', '\'');
      if (value !== -1) return checkChange(command, value, -1, '\'', depth + 1);
    }
    return prevValue;
  }
  function handleVar(command) {
    if (command === '') return command;
    let replaced = false;
    for (let i = 0; i + 1 < command.length; i++) {
      if (command[i] === '$') {
        const next = command[i + 1];
        if (next !== '\'' && next !== '\n' && checkChange(command, i, 0, '') !== -1) {
          replaced = true;
          const name = (command.slice(i + 1).match(/[^ "'\n]+/) || [null])[0];
          if (name === null) { status = EPI_ERROR; return null; }
          let value = name[0] === '?' ? String(status) : null;
          if (value === null) {
            const v = sys.vars.find((x) => x.var === name);
            if (v) value = v.value;
            else value = getEnvVar(name);
          }
          if (value === null) {
            termErr(fmt(MSG.UND_VAR, name));
            status = COMMAND_ERROR;
            return null;
          }
          command = command.slice(0, i) + value + command.slice(i + name.length + 1);
        }
      }
      // check_error : après un remplacement, un statut précédent de 1 fait abandonner la ligne.
      if (replaced && status === COMMAND_ERROR) return null;
    }
    return command;
  }

  // lib/my/my_str_to_word_array.c
  function strToWordArray(buf, delim, stay) {
    const words = [];
    let i = 0;
    while (i < buf.length) {
      const c = buf[i];
      if (delim.includes(c)) { i++; continue; }
      if (stay.includes(c)) {
        const end = buf.indexOf(c, i + 1);
        if (end < 0) { termErr(`Unmatched '${c}'.\n`); return null; }
        words.push(buf.slice(i + 1, end));
        i = end + 1;
        continue;
      }
      let j = i;
      while (j < buf.length && !delim.includes(buf[j])) j++;
      words.push(buf.slice(i, j));
      i = j;
    }
    return words;
  }

  function checkPare(args) {
    let count = 0;
    for (const a of args) {
      if (a[0] === ')') count--;
      if (a[0] === '(') count++;
      if (count === -1) { termErr(MSG.TOO_MANY_CLOSE_PARE); return false; }
    }
    if (count !== 0) { termErr(MSG.TOO_MANY_OPEN_PARE); return false; }
    return true;
  }

  // src/built-in/history/add_to_history.c
  function addToHistory(cmd) {
    const h = sys.history;
    const text = cmd.endsWith('\n') ? cmd.slice(0, -1) : cmd;
    h.list.push({ n: h.list.length ? h.list[h.list.length - 1].n + 1 : 0, cmd: text });
    h.buff++;
    if (h.buff + h.fileLines > HIST_BUFF_MAX) h.list.shift();
  }
  function handleHistory(args) {
    if (!args.length) return null;
    if (args[0] === '!!' && sys.history.list.length) {
      const prev = sys.history.list[sys.history.list.length - 1].cmd.split(/[ \n]+/).filter(Boolean);
      args = [...prev, ...args.slice(1)];
    }
    addToHistory(args.join(' '));
    return args;
  }

  // src/built-in/alias/check_alias.c
  function checkAlias(args) {
    const reset = () => sys.alias.forEach((a) => { a.status = true; });
    // Garde-fou du navigateur : un alias qui se rappelle après un « | » bouclerait sans fin.
    let budget = 256;
    for (let i = 0; i < args.length && budget > 0; i++) {
      if (i > 0) {
        if (!START_NEW_CMD.includes(args[i - 1])) continue;
        reset();
      }
      const entry = sys.alias.find((a) => a.status && a.alias === args[i]);
      if (!entry) continue;
      entry.status = false;
      const tab = strToWordArray(entry.cmd, ' ', '\'"');
      if (tab) {
        args = [...args.slice(0, i), ...tab, ...args.slice(i + 1)];
        i--;
        budget--;
      }
    }
    reset();
    return args;
  }

  // src/parsing/wave.c
  function replaceWave(args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg[0] !== '~') continue;
      if (arg.length === 1 || arg[1] === '/') {
        const home = getEnvVar('HOME');
        if (home === null) { termErr(fmt(MSG.NO_FILE_DIR, '')); return false; }
        args[i] = home + arg.slice(1);
      } else {
        const user = arg.slice(1).split('/')[0];
        const passwd = lookup('/etc/passwd');
        const users = passwd ? passwd.content.split('\n').map((l) => l.split(':')[0]) : [];
        if (!users.includes(user)) { termErr(fmt(MSG.UKN_USER, user)); return false; }
        args[i] = `/home/${user}${arg.slice(1 + user.length)}`;
      }
    }
    return true;
  }

  // src/parsing/star.c et question_mark.c
  function handleStar(args) {
    if (!args.some((a) => a.includes('*'))) return args;
    let found = false;
    const out = [];
    args.forEach((a) => {
      if (!a.includes('*')) { out.push(a); return; }
      const matches = glob(a, false);
      if (matches.length) { found = true; out.push(...matches); }
    });
    if (!found) { termErr(fmt(MSG.NO_MATCH_STAR, out[0] ?? '')); return null; }
    return out;
  }
  function handleQuestionMark(args) {
    if (!args.some((a) => a.includes('?'))) return args;
    const first = args[0];
    let found = false;
    const out = [];
    args.forEach((a) => {
      if (!a.includes('?')) { out.push(a); return; }
      const pattern = a.replace(/\?/g, '*');
      const matches = glob(pattern, false).filter((m) => m.length === pattern.length);
      if (matches.length) { found = true; out.push(...matches); }
    });
    if (!found) { termErr(fmt(MSG.NO_MATCH_STAR, first)); return null; }
    return out;
  }
  // src/built-in/scripting/format_scripting.c
  function formatScripting(args) {
    args = checkAlias(args);
    if (!replaceWave(args)) return null;
    args = handleStar(args);
    if (!args) return null;
    return handleQuestionMark(args);
  }

  /* ---------- Arbre des opérateurs (make_tree.c, check_tree.c, check_operators.c) ---------- */
  const OPS = [
    { type: 'SEMICOLON', s: ';', prio: 7 },
    { type: 'OR', s: '||', prio: 6 },
    { type: 'AND', s: '&&', prio: 5 },
    { type: 'R', s: '>', prio: 4 },
    { type: 'RR', s: '>>', prio: 3 },
    { type: 'L', s: '<', prio: 2 },
    { type: 'LL', s: '<<', prio: 2 },
    { type: 'PIPE', s: '|', prio: 1 },
  ];
  function makeTree(command) {
    const tree = { command, type: 'NONE', left: null, right: null };
    let best = { prio: 0, type: 'NONE' };
    command.forEach((tok, i) => OPS.forEach((op) => {
      if (op.prio > best.prio && tok === op.s && !isBetweenList(command, i)) best = op;
    }));
    tree.type = best.type;
    if (tree.type === 'NONE') return tree;
    let index = 0;
    const op = OPS.find((o) => o.type === tree.type);
    for (let i = 0; i < command.length; i++) {
      if (command[i] === op.s && !isBetweenList(command, i)) { index = i; break; }
    }
    tree.left = makeTree(command.slice(0, index));
    tree.right = makeTree(command.slice(index + 1));
    return tree;
  }
  const isEmpty = (branch) => !branch || !branch.command || !branch.command.length;
  const errorRedirect = (branch, message) => {
    if (!isEmpty(branch)) return false;
    termErr(`${message}\n`);
    return true;
  };
  function checkType(t) {
    switch (t.type) {
      case 'OR':
      case 'PIPE':
        return errorRedirect(t.right, MSG.NULL_COM) || errorRedirect(t.left, MSG.NULL_COM);
      case 'AND':
        return errorRedirect(t.right, MSG.NULL_COM);
      case 'R':
      case 'RR':
        if (t.right && t.right.type !== 'NONE') { termErr(MSG.AMBI_OUT); return true; }
        return errorRedirect(t.right, MSG.MISS_NAME) || errorRedirect(t.left, MSG.NULL_COM);
      case 'L':
        if (t.left && t.left.type === 'PIPE') { termErr(MSG.AMBI_IN); return true; }
        if (errorRedirect(t.right, MSG.MISS_NAME) || errorRedirect(t.left, MSG.NULL_COM)) return true;
        if (!isFile(t.right.command[0])) { termErr(fmt(MSG.NO_FILE_DIR, t.right.command[0])); return true; }
        return false;
      case 'LL':
        if (t.right && t.right.type === 'PIPE') { termErr(MSG.AMBI_IN); return true; }
        return errorRedirect(t.right, MSG.MISS_NAME) || errorRedirect(t.left, MSG.NULL_COM);
      default:
        return false;
    }
  }
  const checkTree = (t) => (t.left && checkTree(t.left)) || (t.right && checkTree(t.right)) || checkType(t);

  /* ---------- Exécution (src/execution, src/operators) ---------- */
  async function execProperFunction(args, ret, io = term) {
    if (!args || !args.length) return ret;
    return parseTree(makeTree(args), io);
  }
  async function parseTree(tree, io) {
    if (isEmpty(tree)) return 0;
    if (tree.type !== 'SEMICOLON') {
      if (checkTree(tree)) return 1;
      return execOperator(tree, io);
    }
    await parseTree(tree.left, io);
    return parseTree(tree.right, io);
  }
  async function execOperator(tree, io) {
    switch (tree.type) {
      case 'NONE': return execCommand(tree.command, io);
      case 'OR': {
        const ret = await execOperator(tree.left, io);
        return ret === 0 ? ret : execOperator(tree.right, io);
      }
      case 'AND': {
        const ret = await execOperator(tree.left, io);
        return ret !== 0 ? ret : execOperator(tree.right, io);
      }
      case 'R':
      case 'RR': {
        const name = tree.right.command[0];
        const target = openWrite(name, tree.type === 'RR');
        if (typeof target === 'string') { termErr(`${name}: ${target}.\n`); return 1; }
        // Le parent ne récupère pas le statut de l'enfant : exec_rr_r renvoie toujours 0.
        await inChild(() => execOperator(tree.left, { ...io, tty: false, out: (t) => { target.content += t; target.mtime = new Date(); } }));
        return 0;
      }
      case 'L': {
        const n = lookup(tree.right.command[0]);
        return execOperator(tree.left, { ...io, stdin: n.content });
      }
      case 'LL': {
        const word = tree.right.command[0];
        let text = '';
        for (;;) {
          const line = await readLine();
          if (line === null || line === word) break;
          text += `${line}\n`;
        }
        return execOperator(tree.left, { ...io, stdin: text });
      }
      case 'PIPE': return execPipe(tree, io);
      default: return EPI_ERROR;
    }
  }
  async function execPipe(tree, io) {
    if (tree.type === 'NONE') return execCommand(tree.command, io);
    let buffer = '';
    await inChild(() => execCommandNoFork(tree.left.command, { ...io, tty: false, out: (t) => { buffer += t; } }));
    return execPipe(tree.right, { ...io, stdin: buffer });
  }
  // exec_command.c : « & », « fg » ou « jobs » n'importe où dans la commande déclenche la gestion des tâches.
  async function execCommand(args, io) {
    if (!args.length) throw new Segfault();
    for (const a of args) {
      if (has(JOBS, a)) { await JOBS[a](args, io); return 0; }
    }
    if (has(BUILTINS, args[0])) return BUILTINS[args[0]](args, io);
    return command(args, io);
  }
  async function execCommandNoFork(args, io) {
    for (const a of args) {
      if (has(JOBS, a)) { await JOBS[a](args, io); return 0; }
    }
    if (has(BUILTINS, args[0])) { await BUILTINS[args[0]](args, io); return 0; }
    return command(args, io);
  }
  // which_path.c
  function whichPath(cmd, paths) {
    if (cmd === undefined || paths === null) return null;
    for (const p of paths.split(/[:\n]/).filter(Boolean)) {
      const candidate = `${p}/${cmd}`;
      if (isFile(candidate)) return candidate;
    }
    return null;
  }
  // do_existing_command.c : recherche dans le PATH, puis stat, puis en-tête ELF.
  async function command(args, io) {
    const paths = isEnvVariable('PATH') ? getEnvVar('PATH') : '/bin:/usr/bin';
    const path = whichPath(args[0], paths) ?? args[0];
    const n = lookup(path);
    if (!n) { termErr(fmt(MSG.COM_NOT_FOUND, path)); return 1; }
    if (n.type !== 'file') { termErr(fmt(MSG.PERM_DENIED, path)); return 1; }
    if (!n.content.startsWith('\x7fELF') || !PROGRAMS[n.prog]) { termErr(fmt(MSG.FORM_ERROR, path)); return 1; }
    interrupted = false;
    running = true;
    try {
      const ret = await PROGRAMS[n.prog](args, io);
      if (interrupted) { term.out('\n'); return 0; }
      return ret ?? 0;
    } finally {
      running = false;
      interrupted = false;
    }
  }

  /* ---------- Builtins (src/built-in) ---------- */
  const strtol = (s) => { const m = /^\s*([+-]?\d+)/.exec(s); return { value: m ? Number(m[1]) : 0, rest: m ? s.slice(m[0].length) : s }; };
  const atoi = (s) => strtol(s).value;
  // lib/my/is_int_float.c : 0 naturel, 1 entier, 2 rationnel, 3 pas un nombre
  function isIntFloat(s) {
    if (s === '') return 3;
    let error = 0;
    let sign = 0;
    let point = 0;
    for (const c of s) {
      if (!/[0-9]/.test(c)) error++;
      if (c === '-' && sign === 0) sign++;
      if (c === '.' && point === 0) point++;
    }
    if (error === 0) return 0;
    if (error === sign) return 1;
    if (error === sign + point) return 2;
    return 3;
  }
  const correctName = (name, letter, alnum) => {
    if (!FIRST_ENV_CHAR.test(name)) { termErr(letter); return false; }
    if (!ENV_CHARS.test(name)) { termErr(alnum); return false; }
    return true;
  };
  const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const isBuiltIn = (name) => has(BUILTINS, name);
  const isGoodArchi = (path) => { const n = lookup(path); return !!n && n.type === 'file' && n.content.startsWith('\x7fELF'); };

  async function runScriptLines(lines, sub, io) {
    let ret = 0;
    for (const raw of lines) {
      if (sys.hasExited) break;
      let tab = strToWordArray(raw, ' \t\n', '');
      if (sub) tab = sub(tab);
      tab = formatScripting(tab);
      if (!tab) { ret = 1; continue; }
      ret = await execProperFunction(tab, 0, io);
    }
    return ret;
  }
  async function readBlock(prompt, endWord) {
    const lines = [];
    for (;;) {
      const line = await readLine([[prompt, null]]);
      if (line === null) return null;
      if (line === endWord) return lines;
      lines.push(formatCmd(`${line}\n`));
    }
  }
  // get_condition.c
  function cmpNb(op, a, b) {
    switch (op) {
      case '==': return a === b;
      case '!=': return a !== b;
      case '>': return a > b;
      case '>=': return a >= b;
      case '<': return a < b;
      case '<=': return a <= b;
      default: return null;
    }
  }
  function getCondition(args) {
    const arg = (i) => args[i] ?? '';
    if (arg(0)[0] !== '(') {
      if (isIntFloat(arg(0)) > 1) return null;
      return { cond: atoi(arg(0)) !== 0, ind: 1 };
    }
    if (arg(1)[0] === ')') return { cond: false, ind: 2 };
    if (arg(2)[0] === ')') {
      const c = cmpNb(arg(1), 0, 0);
      if (c !== null) return { cond: c, ind: 3 };
      if (isIntFloat(arg(1)) > 1) return null;
      return { cond: atoi(arg(1)) !== 0, ind: 3 };
    }
    if (arg(3)[0] === ')') {
      const [a, b] = [arg(1), arg(2)];
      let c = null;
      if (isIntFloat(a) < 2) c = cmpNb(b, atoi(a), 0);
      else if (isIntFloat(b) < 2) c = cmpNb(a, 0, atoi(b));
      else if (b === '==' || b === '!=') c = b === '==' ? a === '' : a !== '';
      else if (a === '==' || a === '!=') c = a === '==' ? b === '' : b !== '';
      return c === null ? null : { cond: c, ind: 4 };
    }
    if (arg(4)[0] === ')') {
      const [a, op, b] = [arg(1), arg(2), arg(3)];
      let c;
      if (isIntFloat(a) < 2 && isIntFloat(b) < 2) c = cmpNb(op, atoi(a), atoi(b));
      else c = op === '==' ? a === b : op === '!=' ? a !== b : null;
      return c === null ? null : { cond: c, ind: 5 };
    }
    return null;
  }

  const BUILTINS = {
    cd(args, io) {
      const oldPwd = getEnvVar('OLDPWD');
      changeOrCreate('OLDPWD', cwd);
      if (args.length > 2) { termErr(MSG.CD_TOO_MANY); return 1; }
      const go = (path) => {
        const n = path === null ? null : lookup(path);
        if (n && n.type === 'file') { termErr(fmt(MSG.NOT_DIR, path)); return 1; }
        if (!n || n.type !== 'dir') {
          if (path === null || path[0] !== '~') termErr(fmt(MSG.NO_FILE_DIR, path ?? '(null)'));
          return 1;
        }
        cwd = resolve(path);
        changeOrCreate('PWD', cwd);
        return 0;
      };
      if (args.length === 1) return go(getEnvVar('HOME'));
      if (args[1] === '-') return go(oldPwd);
      return go(args[1]);
    },
    env(args, io) {
      sys.env.forEach((line) => io.out(`${line}\n`));
      return 0;
    },
    setenv(args, io) {
      if (args.length > 3) { termErr(MSG.SETENV_TOO_MANY); return 1; }
      if (args.length === 1) return BUILTINS.env(args, io);
      if (!correctName(args[1], MSG.SETENV_LETTER, MSG.SETENV_ALNUM)) return 1;
      changeOrCreate(args[1], args[2]);
      return 0;
    },
    unsetenv(args) {
      if (args.length < 2) { termErr(MSG.UNSETENV_TOO_FEW); return 1; }
      args.slice(1).forEach((name) => {
        const i = sys.env.findIndex((l) => l.split('=')[0] === name);
        if (i >= 0) sys.env.splice(i, 1);
      });
      return 0;
    },
    exit(args) {
      if (args.length > 2 || (args[1] !== undefined && !/^[0-9]*$/.test(args[1]))) { termErr(MSG.EXT_SYN); return 1; }
      sys.hasExited = true;
      return args[1] !== undefined ? atoi(args[1]) % 256 : 0;
    },
    alias(args, io) {
      if (args.length === 1) {
        sys.alias.forEach((a) => io.out(a.bracket ? `${a.alias}\t(${a.cmd})\n` : `${a.alias}\t${a.cmd}\n`));
        return 0;
      }
      if (args.length === 2) return 0;
      const cmd = args.slice(2).join(' ');
      const bracket = args.length > 3;
      const existing = sys.alias.find((a) => a.alias === args[1]);
      if (existing) Object.assign(existing, { cmd, bracket });
      else sys.alias.push({ alias: args[1], cmd, bracket, status: true });
      sys.alias.sort((a, b) => byteCompare(a.alias, b.alias));
      return 0;
    },
    unalias(args) {
      if (args.length === 1) { termErr(MSG.UNALIAS); return 1; }
      args.slice(1).forEach((name) => { sys.alias = sys.alias.filter((a) => a.alias !== name); });
      return 0;
    },
    history(args, io) {
      if (args.length > 2) { termErr(MSG.HISTORY_TOO_MANY); return EPI_ERROR; }
      const list = sys.history.list;
      if (args[1] === undefined) {
        list.forEach((h) => io.out(` ${h.n} ${h.cmd}\n`));
        return 0;
      }
      const n = atoi(args[1]);
      if (n < 0) { termErr(MSG.BAD_NUMBER); return EPI_ERROR; }
      // get_nth_node(n - 1, FRM_END) : rien pour 0 ou 1, sinon les n dernières.
      if (n - 1 >= 1 && n - 1 < list.length) list.slice(Math.max(0, list.length - n)).forEach((h) => io.out(` ${h.n} ${h.cmd}\n`));
      return 0;
    },
    which(args, io) {
      if (args.length < 2) { termErr(MSG.WHICH_TOO_FEW); return 1; }
      let ret = 0;
      for (const a of args.slice(1)) {
        const paths = getEnvVar('PATH');
        if (paths === null) return 1;
        if (isBuiltIn(a)) { io.out(fmt(MSG.WHICH_BUILT_IN, a)); ret = 0; continue; }
        const origin = whichPath(a, paths);
        if (origin === null && (!isFile(a) || !isGoodArchi(a))) { io.out(fmt(MSG.COM_NOT_FOUND, a)); ret = 1; continue; }
        io.out(`${origin ?? a}\n`);
        ret = 0;
      }
      return ret;
    },
    where(args, io) {
      if (args.length < 2) { termErr(MSG.WHERE_TOO_FEW); return 1; }
      let ret = 0;
      for (const a of args.slice(1)) {
        const paths = getEnvVar('PATH');
        if (paths === null) return 1;
        if (isBuiltIn(a)) { io.out(fmt(MSG.WHERE_BUILT_IN, a)); continue; }
        if (a.includes('/')) { io.out(MSG.WHERE_IS_PATH); ret = 1; continue; }
        let found = false;
        paths.split(':').filter(Boolean).forEach((p) => {
          const origin = whichPath(a, p);
          if (origin) { io.out(`${origin}\n`); found = true; }
        });
        if (!found) ret = 1;
      }
      return ret;
    },
    async repeat(args, io) {
      if (args.length < 3) { termErr(MSG.REPEAT_TOO_FEW); return 1; }
      const kind = isIntFloat(args[1]);
      if (kind === 3 || kind === 2) { termErr(MSG.REPEAT_BAD_NB); return 1; }
      const tab = formatScripting(args.slice(2));
      if (!tab) return 1;
      let ret = 0;
      for (let i = 0; ret !== EPI_ERROR && i < atoi(args[1]); i++) {
        ret = await execProperFunction([...tab], ret, io);
        if (sys.hasExited) break;
      }
      return ret;
    },
    async foreach(args, io) {
      if (args.length < 3) { termErr(MSG.FOREACH_TOO_FEW); return 1; }
      const words = args.slice(2);
      let start = 0;
      if (words[0] === '(') {
        if (words[words.length - 1] !== ')') { termErr(MSG.FOREACH_NOT_PAR); return 1; }
        start = 1;
      } else if (words.length !== 1) { termErr(MSG.FOREACH_NOT_PAR); return 1; }
      const values = words.slice(start, -1);
      const body = await readBlock(MSG.FOREACH_PROMPT, MSG.END);
      if (body === null) { termErr(MSG.FOREACH_NO_END); return 1; }
      let ret = 0;
      for (const value of values) {
        if (sys.hasExited) break;
        ret = await runScriptLines(body, (tab) => tab.map((t) => (t === `$${args[1]}` ? value : t)), io);
      }
      return ret;
    },
    jkill(args, io) {
      const usage = () => {
        termErr('To use kill, type :\n[jkill ID], where ID is the ID of the process you want to kill.\nType [jobs] to see the processes that are currently running and their IDs.\nTo kill all the processes that are currently running on this shell, type : \n[jkill all]\n');
        return EPI_ERROR;
      };
      if (args.length !== 2) return usage();
      if (args[1] === 'all') {
        if (!sys.jobs.length) return usage();
        const n = sys.jobs.length;
        sys.jobs = [];
        io.out(`Successfully killed ${n} jobs.\n`);
        return 0;
      }
      const id = strtol(args[1]).value;
      if (id === 0) return usage();
      const job = sys.jobs.find((j) => j.id === id);
      if (!job) return usage();
      io.out(`Successfully killed job [${job.id}]. Was : ${job.cmd.map((w) => `${w} `).join('')}.\n`);
      sys.jobs = sys.jobs.filter((j) => j !== job);
      return 0;
    },
    set(args, io) {
      if (args.length === 1) {
        sys.vars.forEach((v) => io.out(`${v.var}\t${v.value}\n`));
        return 0;
      }
      const add = (name, value) => {
        if (!correctName(name, MSG.SET_LETTER, MSG.SET_ALNUM)) return false;
        sys.vars = sys.vars.filter((v) => v.var !== name);
        sys.vars.push({ var: name, value });
        sys.vars.sort((a, b) => byteCompare(a.var, b.var));
        return true;
      };
      for (let i = 1; i < args.length; i++) {
        const pos = args[i].indexOf('=');
        let ok;
        if (pos !== -1) ok = add(args[i].slice(0, pos), args[i].slice(pos + 1));
        else if (args[i + 1] !== '=' || args[i + 2] === undefined) ok = add(args[i], '');
        else { ok = add(args[i], args[i + 2]); i += 2; }
        if (pos === -1 && args[i + 1] === '=' && args[i + 2] === undefined) i++;
        if (!ok) return 1;
      }
      return 0;
    },
    unset(args) {
      if (args.length < 2) { termErr(MSG.UNSET_TOO_FEW); return 1; }
      args.slice(1).forEach((name) => { sys.vars = sys.vars.filter((v) => v.var !== name); });
      return 0;
    },
    async if(args, io) {
      if (args.length < 3) { termErr(MSG.IF_TOO_FEW); return 1; }
      const rest = args.slice(1);
      const c = getCondition(rest);
      if (c === null) { termErr(MSG.IF_SYNTAX); return 1; }
      if (rest[c.ind] === undefined) { termErr(MSG.IF_EMPTY); return 1; }
      if (rest[c.ind] === MSG.THEN) {
        if (rest[c.ind + 1] !== undefined) { termErr(MSG.IF_IMPROPER); return 1; }
        const body = await readBlock(MSG.IF_PROMPT, MSG.ENDIF);
        if (body === null) { termErr(MSG.THEN_NO_END); return 1; }
        if (!c.cond) return 0;
        return runScriptLines(body, null, io);
      }
      if (!c.cond) return 0;
      const tab = formatScripting(rest.slice(c.ind));
      if (!tab) return 1;
      return execProperFunction(tab, 0, io);
    },
    'ai-setup'(args, io) {
      // Le vrai ai-setup demande une clé d'API OpenAI : jamais sur une page web.
      io.out('ai-setup : désactivé dans cette émulation (le vrai 42sh enregistre ici une clé d\'API OpenAI).\n');
      return 1;
    },
  };

  /* ---------- Tâches de fond (src/jobs) ---------- */
  const words = (cmd) => cmd.map((w) => `${w} `).join('');
  const JOBS = {
    '&'(args, io) {
      const idx = args.indexOf('&');
      const cmd = args.slice(0, idx);
      if (!cmd.length) return;
      jobId++;
      pid += 1 + Math.floor(Math.random() * 40);
      sys.jobs.unshift({ pid, id: jobId, cmd });
      const [head, next] = sys.jobs;
      if (!next) io.out(`[${head.id}] ${head.pid}\n`);
      else io.out(`[${head.id}] ${head.pid}\n[${next.id}]  + Suspended (tty output)\t\t${words(next.cmd)}\n`);
    },
    jobs(args, io) {
      if (!sys.jobs.length) { io.out('There are no jobs running in background.\n'); return; }
      sys.jobs.forEach((j) => io.out(`[${j.id}]\tSuspended (tty output)\t\t${words(j.cmd)}\n`));
    },
    async fg(args, io) {
      if (!sys.jobs.length) { termErr('fg: No current job.\n'); return; }
      if (args.length !== 1 && args[0] !== 'fg') { termErr('fg: Wrong usage of fg\n'); return; }
      let job = sys.jobs[0];
      if (args.length === 2 && args[0] === 'fg') {
        const { value, rest } = strtol(args[1]);
        job = rest === '' ? sys.jobs.find((j) => j.id === value) : null;
        if (!job) { termErr('fg: No such job.\n'); return; }
      }
      sys.jobs = sys.jobs.filter((j) => j !== job);
      await inChild(() => execCommand(job.cmd, term));
      io.out(`${words(job.cmd)}\n`);
    },
  };

  /* ---------- Programmes simulés (coreutils, sortie GNU en locale C) ---------- */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad2 = (n) => String(n).padStart(2, '0');
  const splitLines = (text) => {
    if (!text) return [];
    const l = text.split('\n');
    if (l[l.length - 1] === '') l.pop();
    return l;
  };
  // Options courtes groupées (-la) ; « -- » termine les options.
  function parseOpts(args, allowed, name, io) {
    const flags = new Set();
    const rest = [];
    let done = false;
    for (const a of args) {
      if (!done && a === '--') { done = true; continue; }
      if (!done && a.length > 1 && a[0] === '-' && !/^-\d/.test(a)) {
        for (const c of a.slice(1)) {
          if (!allowed.includes(c)) {
            termErr(`${name}: invalid option -- '${c}'\nTry '${name} --help' for more information.\n`);
            return null;
          }
          flags.add(c);
        }
      } else rest.push(a);
    }
    return { flags, rest };
  }
  function readFiles(files, io, name) {
    let text = '';
    let ok = true;
    files.forEach((f) => {
      const n = lookup(f);
      if (!n) { termErr(`${name}: ${f}: No such file or directory\n`); ok = false; }
      else if (n.type === 'dir') { termErr(`${name}: ${f}: Is a directory\n`); ok = false; }
      else text += n.content;
    });
    return { text, ok };
  }
  async function input2(files, io, name) {
    if (!files.length || (files.length === 1 && files[0] === '-')) return { text: await readAll(io), ok: true };
    return readFiles(files, io, name);
  }
  function columns(names, io) {
    if (!names.length) return;
    if (!io.tty) { io.out(names.map((n) => `${n}\n`).join('')); return; }
    const width = termCols();
    for (let c = names.length; c >= 1; c--) {
      const rows = Math.ceil(names.length / c);
      if (c > 1 && Math.ceil(names.length / rows) < c) continue;
      const widths = [];
      for (let col = 0; col < c; col++) widths.push(Math.max(0, ...names.slice(col * rows, col * rows + rows).map((n) => n.length)));
      const total = widths.reduce((s, w) => s + w + 2, -2);
      if (total <= width || c === 1) {
        let out = '';
        for (let r = 0; r < rows; r++) {
          const line = [];
          for (let col = 0; col < c; col++) {
            const name = names[col * rows + r];
            if (name === undefined) continue;
            const last = col === c - 1 || names[(col + 1) * rows + r] === undefined;
            line.push(last ? name : name.padEnd(widths[col] + 2));
          }
          out += `${line.join('')}\n`;
        }
        io.out(out);
        return;
      }
    }
  }
  function modeString(n) {
    const bits = n.mode;
    const rwx = (v) => `${v & 4 ? 'r' : '-'}${v & 2 ? 'w' : '-'}${v & 1 ? 'x' : '-'}`;
    return (n.type === 'dir' ? 'd' : '-') + rwx(bits >> 6) + rwx((bits >> 3) & 7) + rwx(bits & 7);
  }
  const lsDate = (d) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const size = (n) => (n.type === 'dir' ? 4096 : n.content.length);
  const blocks = (n) => (n.type === 'dir' ? 4 : Math.ceil(n.content.length / 4096) * 4);

  const PROGRAMS = {
    ls(args, io) {
      const o = parseOpts(args.slice(1), 'aAlF1CRd', 'ls', io);
      if (!o) return 2;
      const { flags } = o;
      const operands = o.rest.length ? o.rest : ['.'];
      const suffix = (n) => (!flags.has('F') ? '' : n.type === 'dir' ? '/' : n.mode & 0o111 ? '*' : '');
      const longLines = (entries) => {
        const sizeW = Math.max(...entries.map(([, n]) => String(size(n)).length));
        const linkW = Math.max(...entries.map(([, n]) => String(n.type === 'dir' ? 2 + Object.values(n.children).filter((c) => c.type === 'dir').length : 1).length));
        return entries.map(([name, n]) => `${modeString(n)} ${String(n.type === 'dir' ? 2 + Object.values(n.children).filter((c) => c.type === 'dir').length : 1).padStart(linkW)} ${n.owner} ${n.owner} ${String(size(n)).padStart(sizeW)} ${lsDate(n.mtime)} ${name}${suffix(n)}\n`).join('');
      };
      const show = (entries) => {
        if (!entries.length) return;
        if (flags.has('l')) io.out(longLines(entries));
        else if (flags.has('1') || (!io.tty && !flags.has('C'))) io.out(entries.map(([name, n]) => `${name}${suffix(n)}\n`).join(''));
        else columns(entries.map(([name, n]) => name + suffix(n)), { ...io, tty: true });
      };
      let ret = 0;
      const files = [];
      const dirs = [];
      operands.forEach((p) => {
        const n = lookup(p);
        if (!n) { termErr(`ls: cannot access '${p}': No such file or directory\n`); ret = 2; return; }
        if (n.type === 'dir' && !flags.has('d')) dirs.push([p, n]);
        else files.push([p, n]);
      });
      files.sort((a, b) => byteCompare(a[0], b[0]));
      dirs.sort((a, b) => byteCompare(a[0], b[0]));
      show(files);
      dirs.forEach(([p, n], i) => {
        if (operands.length > 1) io.out(`${files.length || i ? '\n' : ''}${p}:\n`);
        const entries = Object.entries(n.children).filter(([name]) => flags.has('a') || flags.has('A') || name[0] !== '.');
        if (flags.has('a')) entries.push(['.', n], ['..', lookup(normalize(`${resolve(p)}/..`)) || n]);
        entries.sort((a, b) => byteCompare(a[0], b[0]));
        if (flags.has('l')) io.out(`total ${entries.reduce((s, [, c]) => s + blocks(c), 0)}\n`);
        show(entries);
      });
      return ret;
    },
    async cat(args, io) {
      const o = parseOpts(args.slice(1), 'enEbAs', 'cat', io);
      if (!o) return 1;
      const ends = o.flags.has('e') || o.flags.has('E') || o.flags.has('A');
      let lineNo = 0;
      const render = (text) => {
        let out = text;
        if (o.flags.has('n')) out = out.replace(/^(.*)$/gm, (m, l, off) => (off === out.length ? m : `${String(++lineNo).padStart(6)}\t${l}`));
        if (ends) out = out.replace(/\n/g, '$\n');
        return out;
      };
      const files = o.rest.length ? o.rest : ['-'];
      let ret = 0;
      for (const f of files) {
        if (f === '-') {
          if (io.stdin !== null) io.out(render(io.stdin));
          else {
            for (;;) {
              const line = await readLine();
              if (line === null || interrupted) break;
              io.out(render(`${line}\n`));
            }
          }
          continue;
        }
        const r = readFiles([f], io, 'cat');
        if (!r.ok) ret = 1;
        else io.out(render(r.text));
      }
      return ret;
    },
    echo(args, io) {
      let i = 1;
      let newline = true;
      let escapes = false;
      while (i < args.length && /^-[neE]+$/.test(args[i])) {
        for (const c of args[i].slice(1)) {
          if (c === 'n') newline = false;
          else if (c === 'e') escapes = true;
          else escapes = false;
        }
        i++;
      }
      let text = args.slice(i).join(' ');
      if (escapes) {
        const cut = text.indexOf('\\c');
        if (cut >= 0) { text = text.slice(0, cut); newline = false; }
        text = text.replace(/\\([\\abefnrtv0])/g, (m, c) => ({ '\\': '\\', a: '\x07', b: '\b', e: '\x1b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v', 0: '' }[c]));
      }
      io.out(newline ? `${text}\n` : text);
      return 0;
    },
    pwd(args, io) { io.out(`${cwd}\n`); return 0; },
    whoami(args, io) { io.out('visiteur\n'); return 0; },
    hostname(args, io) { io.out(`${sys.hostname ?? 'portfolio'}\n`); return 0; },
    date(args, io) {
      const d = new Date();
      const tz = (new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(d).find((p) => p.type === 'timeZoneName') || { value: 'UTC' }).value;
      io.out(`${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ${tz} ${d.getFullYear()}\n`);
      return 0;
    },
    uname(args, io) {
      io.out(args.includes('-a') ? `Linux ${sys.hostname ?? 'portfolio'} 6.8.0-42sh #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n` : 'Linux\n');
      return 0;
    },
    true: () => 0,
    false: () => 1,
    clear(args, io) { io.out('\x1b[H\x1b[2J\x1b[3J'); return 0; },
    async sleep(args) {
      if (args.length < 2) { termErr('sleep: missing operand\nTry \'sleep --help\' for more information.\n'); return 1; }
      const s = Number(args[1]);
      if (!Number.isFinite(s) || s < 0) { termErr(`sleep: invalid time interval '${args[1]}'\nTry 'sleep --help' for more information.\n`); return 1; }
      await wait(s * 1000);
      return 0;
    },
    async grep(args, io) {
      const o = parseOpts(args.slice(1), 'ivnc', 'grep', io);
      if (!o) return 2;
      if (!o.rest.length) { termErr('Usage: grep [OPTION]... PATTERNS [FILE]...\nTry \'grep --help\' for more information.\n'); return 2; }
      const [pattern, ...files] = o.rest;
      let re;
      try {
        re = new RegExp(pattern.replace(/[+?(){}|]/g, '\\$&'), o.flags.has('i') ? 'i' : '');
      } catch (e) {
        re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), o.flags.has('i') ? 'i' : '');
      }
      const sources = files.length ? files : ['-'];
      let matched = false;
      let ret = 0;
      for (const f of sources) {
        let text;
        if (f === '-') text = await readAll(io);
        else {
          const n = lookup(f);
          if (!n) { termErr(`grep: ${f}: No such file or directory\n`); ret = 2; continue; }
          if (n.type === 'dir') { termErr(`grep: ${f}: Is a directory\n`); continue; }
          text = n.content;
        }
        const prefix = sources.length > 1 ? `${f === '-' ? '(standard input)' : f}:` : '';
        let count = 0;
        splitLines(text).forEach((line, i) => {
          if (re.test(line) === o.flags.has('v')) return;
          count++;
          matched = true;
          if (!o.flags.has('c')) io.out(`${prefix}${o.flags.has('n') ? `${i + 1}:` : ''}${line}\n`);
        });
        if (o.flags.has('c')) io.out(`${prefix}${count}\n`);
      }
      return ret || (matched ? 0 : 1);
    },
    async wc(args, io) {
      const o = parseOpts(args.slice(1), 'lwc', 'wc', io);
      if (!o) return 1;
      const keys = o.flags.size ? ['l', 'w', 'c'].filter((k) => o.flags.has(k)) : ['l', 'w', 'c'];
      const count = (t) => ({ l: (t.match(/\n/g) || []).length, w: t.split(/\s+/).filter(Boolean).length, c: new TextEncoder().encode(t).length });
      if (!o.rest.length) {
        const c = count(await readAll(io));
        io.out(`${keys.map((k) => String(c[k]).padStart(keys.length > 1 ? 7 : 1)).join(' ')}\n`);
        return 0;
      }
      let ret = 0;
      const rows = [];
      const total = { l: 0, w: 0, c: 0 };
      o.rest.forEach((f) => {
        const r = readFiles([f], io, 'wc');
        if (!r.ok) { ret = 1; return; }
        const c = count(r.text);
        Object.keys(total).forEach((k) => { total[k] += c[k]; });
        rows.push([c, f]);
      });
      if (rows.length > 1) rows.push([total, 'total']);
      const w = Math.max(1, ...rows.map(([c]) => String(c.c).length));
      rows.forEach(([c, f]) => io.out(`${keys.map((k) => String(c[k]).padStart(keys.length > 1 || rows.length > 1 ? w : 1)).join(' ')} ${f}\n`));
      return ret;
    },
    async head(args, io) { return headTail(args, io, 'head'); },
    async tail(args, io) { return headTail(args, io, 'tail'); },
    async sort(args, io) {
      const o = parseOpts(args.slice(1), 'rnu', 'sort', io);
      if (!o) return 2;
      const r = await input2(o.rest, io, 'sort');
      if (!r.ok) return 2;
      let lines = splitLines(r.text);
      lines.sort(o.flags.has('n') ? (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0) || byteCompare(a, b) : byteCompare);
      if (o.flags.has('r')) lines.reverse();
      if (o.flags.has('u')) lines = lines.filter((l, i) => i === 0 || l !== lines[i - 1]);
      io.out(lines.map((l) => `${l}\n`).join(''));
      return 0;
    },
    async uniq(args, io) {
      const o = parseOpts(args.slice(1), 'c', 'uniq', io);
      if (!o) return 1;
      const r = await input2(o.rest.slice(0, 1), io, 'uniq');
      if (!r.ok) return 1;
      const groups = [];
      splitLines(r.text).forEach((l) => {
        if (groups.length && groups[groups.length - 1][0] === l) groups[groups.length - 1][1]++;
        else groups.push([l, 1]);
      });
      io.out(groups.map(([l, n]) => (o.flags.has('c') ? `${String(n).padStart(7)} ${l}\n` : `${l}\n`)).join(''));
      return 0;
    },
    async tr(args, io) {
      if (args.length < 3) { termErr(`tr: missing operand${args.length === 2 ? ` after '${args[1]}'` : ''}\nTry 'tr --help' for more information.\n`); return 1; }
      const expand = (set) => set.replace(/(.)-(.)/g, (m, a, b) => {
        let s = '';
        for (let c = a.charCodeAt(0); c <= b.charCodeAt(0); c++) s += String.fromCharCode(c);
        return s;
      }).replace(/\\n/g, '\n');
      const from = expand(args[1]);
      const to = expand(args[2]);
      const text = await readAll(io);
      io.out([...text].map((c) => { const i = from.lastIndexOf(c); return i < 0 ? c : to[Math.min(i, to.length - 1)]; }).join(''));
      return 0;
    },
    seq(args, io) {
      const nums = args.slice(1).map(Number);
      if (!nums.length || nums.some((n) => !Number.isFinite(n))) { termErr(nums.length ? `seq: invalid floating point argument: '${args.slice(1).find((a) => !Number.isFinite(Number(a)))}'\n` : 'seq: missing operand\n'); return 1; }
      const [first, step, last] = nums.length === 1 ? [1, 1, nums[0]] : nums.length === 2 ? [nums[0], 1, nums[1]] : nums;
      let out = '';
      for (let x = first, k = 0; (step > 0 ? x <= last : x >= last) && k < 10000; x += step, k++) out += `${x}\n`;
      io.out(out);
      return 0;
    },
    async rev(args, io) {
      const r = await input2(args.slice(1), io, 'rev');
      io.out(splitLines(r.text).map((l) => `${[...l].reverse().join('')}\n`).join(''));
      return r.ok ? 0 : 1;
    },
    basename(args, io) {
      if (args.length < 2) { termErr('basename: missing operand\nTry \'basename --help\' for more information.\n'); return 1; }
      let b = args[1].replace(/\/+$/, '') || '/';
      b = b === '/' ? '/' : b.slice(b.lastIndexOf('/') + 1);
      if (args[2] && b.endsWith(args[2]) && b !== args[2]) b = b.slice(0, -args[2].length);
      io.out(`${b}\n`);
      return 0;
    },
    dirname(args, io) {
      if (args.length < 2) { termErr('dirname: missing operand\nTry \'dirname --help\' for more information.\n'); return 1; }
      const p = args[1].replace(/\/+$/, '');
      const i = p.lastIndexOf('/');
      io.out(`${i < 0 ? '.' : i === 0 ? '/' : p.slice(0, i)}\n`);
      return 0;
    },
    mkdir(args) {
      const o = parseOpts(args.slice(1), 'p', 'mkdir', term);
      if (!o) return 1;
      if (!o.rest.length) { termErr('mkdir: missing operand\nTry \'mkdir --help\' for more information.\n'); return 1; }
      let ret = 0;
      o.rest.forEach((p) => {
        if (o.flags.has('p')) {
          let cur = '';
          for (const part of resolve(p).split('/').filter(Boolean)) {
            cur += `/${part}`;
            const n = lookup(cur);
            if (n && n.type !== 'dir') { termErr(`mkdir: cannot create directory '${p}': Not a directory\n`); ret = 1; return; }
            if (!n) lookup(normalize(`${cur}/..`)).children[part] = dir({}, { mtime: new Date() });
          }
          return;
        }
        const { parent, name } = parentOf(p);
        if (lookup(p)) { termErr(`mkdir: cannot create directory '${p}': File exists\n`); ret = 1; }
        else if (!parent || parent.type !== 'dir') { termErr(`mkdir: cannot create directory '${p}': No such file or directory\n`); ret = 1; }
        else parent.children[name] = dir({}, { mtime: new Date() });
      });
      return ret;
    },
    rmdir(args) {
      if (args.length < 2) { termErr('rmdir: missing operand\nTry \'rmdir --help\' for more information.\n'); return 1; }
      let ret = 0;
      args.slice(1).forEach((p) => {
        const n = lookup(p);
        const { parent, name } = parentOf(p);
        if (!n) { termErr(`rmdir: failed to remove '${p}': No such file or directory\n`); ret = 1; }
        else if (n.type !== 'dir') { termErr(`rmdir: failed to remove '${p}': Not a directory\n`); ret = 1; }
        else if (Object.keys(n.children).length) { termErr(`rmdir: failed to remove '${p}': Directory not empty\n`); ret = 1; }
        else delete parent.children[name];
      });
      return ret;
    },
    touch(args) {
      if (args.length < 2) { termErr('touch: missing file operand\nTry \'touch --help\' for more information.\n'); return 1; }
      let ret = 0;
      args.slice(1).forEach((p) => {
        const n = lookup(p);
        if (n) { n.mtime = new Date(); return; }
        const f = openWrite(p, true);
        if (typeof f === 'string') { termErr(`touch: cannot touch '${p}': ${f}\n`); ret = 1; }
      });
      return ret;
    },
    rm(args) {
      const o = parseOpts(args.slice(1), 'rRfi', 'rm', term);
      if (!o) return 1;
      const force = o.flags.has('f');
      const recursive = o.flags.has('r') || o.flags.has('R');
      if (!o.rest.length && !force) { termErr('rm: missing operand\nTry \'rm --help\' for more information.\n'); return 1; }
      let ret = 0;
      o.rest.forEach((p) => {
        const n = lookup(p);
        const { parent, name } = parentOf(p);
        if (!n) { if (!force) { termErr(`rm: cannot remove '${p}': No such file or directory\n`); ret = 1; } return; }
        if (n.type === 'dir' && !recursive) { termErr(`rm: cannot remove '${p}': Is a directory\n`); ret = 1; return; }
        if (n === fsRoot || name === '.' || name === '..') { termErr(`rm: refusing to remove '.' or '..' directory: skipping '${p}'\n`); ret = 1; return; }
        delete parent.children[name];
      });
      return ret;
    },
    cp(args) { return copyMove(args, false); },
    mv(args) { return copyMove(args, true); },
  };
  async function headTail(args, io, name) {
    let n = 10;
    const files = [];
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-n') n = atoi(args[++i] ?? '10');
      else if (/^-n\d+$/.test(args[i])) n = atoi(args[i].slice(2));
      else if (/^-\d+$/.test(args[i])) n = atoi(args[i].slice(1));
      else files.push(args[i]);
    }
    const pick = (text) => {
      const lines = splitLines(text);
      return (name === 'head' ? lines.slice(0, n) : lines.slice(Math.max(0, lines.length - n))).map((l) => `${l}\n`).join('');
    };
    if (!files.length) { io.out(pick(await readAll(io))); return 0; }
    let ret = 0;
    files.forEach((f, i) => {
      const n2 = lookup(f);
      if (!n2) { termErr(`${name}: cannot open '${f}' for reading: No such file or directory\n`); ret = 1; return; }
      if (n2.type === 'dir') { termErr(`${name}: error reading '${f}': Is a directory\n`); ret = 1; return; }
      if (files.length > 1) io.out(`${i ? '\n' : ''}==> ${f} <==\n`);
      io.out(pick(n2.content));
    });
    return ret;
  }
  function copyMove(args, move) {
    const name = move ? 'mv' : 'cp';
    const o = parseOpts(args.slice(1), move ? 'f' : 'rRf', name, term);
    if (!o) return 1;
    if (o.rest.length < 2) { termErr(`${name}: missing ${o.rest.length ? `destination file operand after '${o.rest[0]}'` : 'file operand'}\nTry '${name} --help' for more information.\n`); return 1; }
    const dest = o.rest[o.rest.length - 1];
    const destNode = lookup(dest);
    let ret = 0;
    const clone = (n) => (n.type === 'dir' ? dir(Object.fromEntries(Object.entries(n.children).map(([k, c]) => [k, clone(c)])), { mtime: new Date() }) : file(n.content, { mode: n.mode, prog: n.prog, mtime: new Date() }));
    o.rest.slice(0, -1).forEach((src) => {
      const n = lookup(src);
      if (!n) { termErr(`${name}: cannot stat '${src}': No such file or directory\n`); ret = 1; return; }
      if (n.type === 'dir' && !move && !o.flags.has('r') && !o.flags.has('R')) { termErr(`cp: -r not specified; omitting directory '${src}'\n`); ret = 1; return; }
      const base = resolve(src).split('/').pop();
      const target = destNode && destNode.type === 'dir' ? `${resolve(dest)}/${base}` : resolve(dest);
      const { parent, name: tname } = parentOf(target);
      if (!parent || parent.type !== 'dir') { termErr(`${name}: cannot create regular file '${dest}': No such file or directory\n`); ret = 1; return; }
      parent.children[tname] = move ? n : clone(n);
      if (move) { const p = parentOf(src); delete p.parent.children[p.name]; }
    });
    return ret;
  }

  /* ---------- get_input.c et boucle principale (mysh.c) ---------- */
  async function getInput() {
    const line = await readLine(promptParts(), true);
    if (line === null) return { code: 'EOF' };
    const command = `${line}\n`;
    if (command[0] === '%') {
      addToHistory(command);
      termErr(MSG.NO_API_SETUP);
      return { code: COMMAND_ERROR };
    }
    const expanded = handleVar(formatCmd(command));
    if (expanded === null) return { code: 0, args: null };
    let args = strToWordArray(expanded, ' \n\t', '"\'');
    if (args === null) return { code: COMMAND_ERROR };
    if (!checkPare(args)) return { code: COMMAND_ERROR };
    args = handleHistory(args);
    if (args === null) return { code: 0, args: [] };
    args = checkAlias(args);
    if (!replaceWave(args)) return { code: COMMAND_ERROR };
    args = handleStar(args);
    if (args) args = handleQuestionMark(args);
    if (!args) return { code: COMMAND_ERROR };
    return { code: 0, args };
  }
  let sessionId = 0;
  async function mysh() {
    const id = ++sessionId;
    initializeSystem();
    for (;;) {
      const r = await getInput();
      if (id !== sessionId) return;
      if (r.code === 'EOF') break;
      if (r.code === COMMAND_ERROR) { status = COMMAND_ERROR; continue; }
      try {
        status = await execProperFunction(r.args, status);
      } catch (e) {
        if (!(e instanceof Segfault)) throw e;
        // Le vrai 42sh plante aussi ici (exec_command sur une commande vide, par exemple « && ls »).
        termErr('Segmentation fault (core dumped)\n');
        note('[42sh a planté comme le vrai sur cette entrée : nouvelle session]');
        mysh();
        return;
      }
      if (sys.hasExited) break;
    }
    endShell();
    note(`[42sh terminé avec le statut ${status} : nouvelle session]`);
    mysh();
  }

  /* ---------- Saisie : Entrée, Tab, historique, Ctrl+L, Ctrl+D, Ctrl+C ---------- */
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    if (pending) deliver(value);
    else queue.push(value);
  });
  // do_tab.c / exec_tab.c : glob du dernier mot + « * », liste si plusieurs, plus long préfixe commun.
  function doTab() {
    const value = input.value;
    const index = input.selectionStart ?? value.length;
    const before = value.slice(0, index);
    let after = '';
    if (index < value.length) {
      let i = index;
      while (i < value.length && value[i] !== ' ' && value[i] !== '\t') i++;
      after = value.slice(i);
    }
    const word = before.slice(Math.max(before.lastIndexOf(' '), before.lastIndexOf('\t')) + 1);
    const prefix = word.includes('/') ? word.slice(0, word.lastIndexOf('/') + 1) : '';
    const files = glob(`${word}*`, true).map((f) => f.slice(prefix.length));
    if (!files.length) return;
    if (files.length > 1) {
      echoLine(pending.parts, value);
      write(`${files.map((f) => `${f}\t`).join('')}\n\n`, 'term__out');
    }
    let common = files[0];
    files.slice(1).forEach((f) => {
      let i = 0;
      while (i < common.length && common[i] === f[i]) i++;
      common = common.slice(0, i);
    });
    let completed = before;
    if (common) {
      const cut = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\t'), before.lastIndexOf('/')) + 1;
      completed = before.slice(0, cut) + common;
    }
    input.value = completed + after;
    input.setSelectionRange(completed.length, completed.length);
  }
  input.addEventListener('keydown', (event) => {
    const main = pending && pending.main;
    // Tab sert à la complétion : Échap rend la main au clavier (Tab reprend après le terminal).
    if (event.key === 'Escape') { input.blur(); return; }
    if (event.key === 'Tab' && !event.shiftKey && main && input.value.trim()) {
      event.preventDefault();
      doTab();
      return;
    }
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && main) {
      event.preventDefault();
      const list = sys.history.list;
      if (!list.length) return;
      let cur = pending.history;
      if (event.key === 'ArrowUp') cur = cur === null ? list.length - 1 : Math.max(0, cur - 1);
      else if (cur === null) return;
      else cur = cur + 1 >= list.length ? null : cur + 1;
      pending.history = cur;
      input.value = cur === null ? '' : list[cur].cmd;
      return;
    }
    if (!event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === 'l') {
      event.preventDefault();
      screen.replaceChildren();
    } else if (key === 'd') {
      event.preventDefault();
      if (pending) deliver(null, main ? '' : input.value);
    } else if (key === 'c' && input.selectionStart === input.selectionEnd) {
      event.preventDefault();
      if (pending && !main) deliver(null, `${input.value}^C`);
      else if (!pending && running) interrupted = true;
    }
  });
  // Un clic dans l'écran donne le focus à la saisie (sauf sélection de texte).
  screen.addEventListener('mouseup', () => { if (!String(window.getSelection())) input.focus({ preventScroll: true }); });

  /* ---------- Exemples ---------- */
  const EXAMPLES = [
    ['ll'],
    ['echo "hello" | cat -e > out.txt ; cat out.txt'],
    ['cd my_shell && ls src || echo raté'],
    ['cat notes.txt | sort | head -3'],
    ['foreach p (Zappy Arcade Raytracer)', 'echo $p', 'end'],
    ['if ( 2 > 1 ) echo vrai'],
    ['repeat 3 echo 42'],
    ['sleep 2 &', 'jobs', 'fg'],
    ['which cd ls'],
    ['history'],
    ['cat aide.txt'],
  ];
  EXAMPLES.forEach((lines) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = lines.join(' ↵ ');
    b.addEventListener('click', () => {
      queue.push(...lines);
      pump();
      input.focus({ preventScroll: true });
    });
    tryBox.append(b);
  });

  /* ---------- Démarrage ----------
     Derrière le bouton « Essayez par vous-même », le terminal flouté montre une courte session.
     Un clic défloute le terminal, active la saisie et y place le curseur. */
  const body = root.querySelector('.term__body');
  const start = root.querySelector('.term__start');
  makeFs();
  screen.replaceChildren();
  form.hidden = false;
  tryBox.hidden = false;
  queue.push('ls', 'echo "hello" | cat -e', 'cd my_shell && ls src', 'cd ..');
  idleHooks.push(() => {
    note('À vous : le vrai 42sh, porté ligne à ligne (cat aide.txt pour la liste des commandes), ou cliquez sur un exemple.');
  });
  mysh();
  if (body && start) {
    root.classList.add('is-locked');
    body.inert = true;
    start.hidden = false;
    start.addEventListener('click', () => {
      root.classList.remove('is-locked');
      body.inert = false;
      start.hidden = true;
      input.focus({ preventScroll: true });
    });
  }
})();
