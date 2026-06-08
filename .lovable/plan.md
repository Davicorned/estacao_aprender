O problema não é login: sua conta já entrou. O bloqueio é que ainda não existe uma linha em `public.user_roles` ligando o UID dessa conta ao papel `admin`, ou ela foi inserida com o UID errado.

Plano:

1. Confirmar o UID correto da conta
   - No Supabase, abrir `Authentication → Users`.
   - Procurar `estacao_aprender@outlook.com`.
   - Copiar o valor da coluna `User UID` / `ID` dessa conta.

2. Atribuir o papel de admin
   - No `SQL Editor`, executar:

```sql
insert into public.user_roles (user_id, role)
values ('COLE_AQUI_O_UID_DA_CONTA', 'admin')
on conflict (user_id, role) do nothing;
```

3. Verificar se ficou gravado
   - Ainda no SQL Editor, executar:

```sql
select ur.user_id, ur.role, au.email
from public.user_roles ur
join auth.users au on au.id = ur.user_id
where au.email = 'estacao_aprender@outlook.com';
```

   - O resultado esperado é uma linha com `role = admin`.

4. Atualizar a sessão no site
   - Voltar ao site.
   - Fazer logout.
   - Entrar novamente em `/admin/login` com `estacao_aprender@outlook.com`.

Se você quiser, posso depois melhorar a tela de “Sem permissão” para mostrar o UID da conta logada e um botão “verificar novamente”, facilitando esse passo no futuro.