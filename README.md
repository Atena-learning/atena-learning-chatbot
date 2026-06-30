# 🎓 Atena Learning – Chatbot de Inglês

Chatbot de inglês com IA para alunos da Atena Learning. Suporta texto e voz (speaking).

---

## 🚀 Como publicar na Netlify (sem usar terminal)

### Passo 1 – Criar conta no GitHub
1. Acesse [github.com](https://github.com) e crie uma conta gratuita (se ainda não tiver)

### Passo 2 – Criar repositório no GitHub
1. Clique em **"New repository"** (botão verde)
2. Nome: `atena-learning-chatbot`
3. Deixe como **Public** ou **Private** (qualquer um funciona)
4. Clique em **"Create repository"**

### Passo 3 – Subir os arquivos
1. Na página do repositório, clique em **"uploading an existing file"**
2. Extraia o ZIP baixado. Dentro dele tem uma pasta `atena-learning` — abra essa pasta
3. Selecione **todos os arquivos e pastas** que estão dentro dela e arraste para a tela do GitHub
4. Clique em **"Commit changes"**

### Passo 4 – Conectar na Netlify
1. Acesse [netlify.com](https://netlify.com) e faça login com sua conta GitHub
2. Clique em **"Add new site" → "Import an existing project"**
3. Escolha **"Deploy with GitHub"** e autorize o acesso, se pedido
4. Selecione o repositório `atena-learning-chatbot`
5. Nas configurações de build, a Netlify já detecta o Next.js automaticamente:
   - Build command: `next build`
   - Publish directory: pode deixar como sugerido
6. **Antes de clicar em Deploy**, vá em **"Add environment variables"** (mesma tela)

### Passo 5 – Adicionar a API Key (IMPORTANTE!)
1. Em **"Environment variables"**, clique em **"Add a variable"**
2. Key: `GEMINI_API_KEY`
3. Value: sua chave do Google Gemini (veja como pegar mais abaixo)
4. Clique em **"Create variable"**
5. Se você já passou dessa tela: vá em **Site configuration → Environment variables → Add a variable**, salve, e depois em **Deploys → Trigger deploy → Deploy site**

### Passo 6 – Finalizar o deploy
1. Clique em **"Deploy [nome do site]"**
2. Aguarde ~2 minutos

### Passo 7 – Compartilhar com os alunos
Sua URL ficará algo como: `https://atena-learning-chatbot.netlify.app`

> Dica: você pode personalizar esse nome em **Site configuration → Change site name**

Compartilhe esse link com seus alunos! Eles abrem e já podem conversar. 🎉

---

## 🔑 Onde pegar a API Key do Google Gemini (GRATUITA, sem cartão)

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Faça login com sua conta Google
3. Clique em **"Get API key"** (canto superior esquerdo ou no menu)
4. Clique em **"Create API key"**
5. Copie a chave gerada e cole na Netlify (Passo 5 acima)

> **Custo:** R$ 0,00 — o plano gratuito do Gemini permite até 15 requisições por minuto e ~1.500 por dia, mais que suficiente para uma escola de inglês. Não é necessário cadastrar cartão de crédito.

---

## 🎤 Sobre o microfone (Speaking)
- Funciona no **Google Chrome** e **Microsoft Edge**
- O aluno clica no 🎤, fala em inglês, e o texto aparece automaticamente
- Após detectar a fala, o tutor já responde

---

## 📞 Dúvidas?
Criado com ❤️ para a Atena Learning.
