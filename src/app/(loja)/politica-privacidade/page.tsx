import type { Metadata } from 'next'
import Link from 'next/link'
import { brand } from '@/config/brand'
import { CompanyLine, LegalPage, type LegalSection } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: `Como a ${brand.name} coleta, usa e protege seus dados pessoais, de acordo com a LGPD.`,
  alternates: { canonical: '/politica-privacidade' },
}

const email = <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>

// Texto-base alinhado à LGPD (Lei 13.709/2018), descrevendo o que o site faz hoje.
// Revisar com a Kaê (e, se possível, com um advogado) antes de usar em produção.
const sections: LegalSection[] = [
  {
    id: 'quem-somos',
    title: 'Quem cuida dos seus dados',
    body: (
      <>
        <p>
          O controlador dos dados pessoais tratados neste site é a <CompanyLine />.
        </p>
        <p>
          Para qualquer assunto sobre privacidade, inclusive para falar com a pessoa encarregada pelo tratamento de
          dados, escreva para {email}.
        </p>
      </>
    ),
  },
  {
    id: 'dados',
    title: 'Quais dados coletamos',
    body: (
      <>
        <p>
          <strong>Quando você cria uma conta:</strong> nome, e-mail e senha. A senha é guardada criptografada pelo nosso
          provedor de login; ninguém da equipe tem acesso a ela.
        </p>
        <p>
          <strong>Quando você completa o cadastro ou compra:</strong> telefone, endereços de entrega, itens do pedido,
          valores, mensagem do cartão de presente e, quando exigido para pagamento ou nota fiscal, CPF.
        </p>
        <p>
          <strong>Pagamentos:</strong> os dados do cartão são digitados em campos do Mercado Pago e vão direto para ele.
          Não recebemos nem guardamos o número do seu cartão.
        </p>
        <p>
          <strong>Enquanto você navega:</strong> a sacola e a sessão de login ficam salvas no próprio navegador
          (armazenamento local), só para o site funcionar. Nosso provedor de hospedagem registra dados técnicos de
          acesso, como endereço IP, data e hora e páginas pedidas.
        </p>
        <p>
          <strong>Quando você fala com a gente:</strong> o formulário de contato abre uma conversa no WhatsApp com o que
          você escreveu. Dali em diante, valem também as regras do WhatsApp.
        </p>
      </>
    ),
  },
  {
    id: 'uso',
    title: 'Para que usamos e com qual base legal',
    body: (
      <ul>
        <li>
          <strong>Criar e manter sua conta, processar pedidos, entregar e dar suporte:</strong> execução do contrato de
          compra (art. 7º, V, da LGPD).
        </li>
        <li>
          <strong>Cobrar a assinatura do clube e enviar as caixas:</strong> execução do contrato de assinatura (art. 7º,
          V).
        </li>
        <li>
          <strong>Emitir nota fiscal e guardar registros de venda e de acesso:</strong> cumprimento de obrigação legal
          (art. 7º, II).
        </li>
        <li>
          <strong>Prevenir fraudes, proteger o site e melhorar a loja:</strong> legítimo interesse (art. 7º, IX), sempre
          respeitando seus direitos.
        </li>
        <li>
          <strong>Enviar novidades e promoções:</strong> só com o seu consentimento (art. 7º, I), que pode ser retirado
          a qualquer momento.
        </li>
      </ul>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    body: (
      <>
        <p>Não vendemos seus dados. Compartilhamos só o necessário com quem nos ajuda a fazer a loja funcionar:</p>
        <ul>
          <li>
            <strong>Mercado Pago:</strong> processamento de pagamentos e assinaturas.
          </li>
          <li>
            <strong>Correios e transportadoras:</strong> nome, endereço e telefone para a entrega.
          </li>
          <li>
            <strong>Neon e Vercel:</strong> banco de dados, login e hospedagem do site.
          </li>
          <li>
            <strong>ViaCEP:</strong> quando você digita um CEP, ele é consultado para preencher o endereço.
          </li>
          <li>
            <strong>Autoridades:</strong> quando houver obrigação legal ou ordem judicial.
          </li>
        </ul>
        <p>
          Alguns desses serviços guardam dados em servidores fora do Brasil. Nesses casos, a transferência segue o art.
          33 da LGPD, com fornecedores que adotam padrões de segurança e cláusulas contratuais de proteção de dados.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies e armazenamento no navegador',
    body: (
      <>
        <p>
          Usamos apenas o armazenamento essencial: a sacola de compras e a sessão de login. Hoje o site não usa cookies
          de publicidade nem ferramentas de análise de terceiros.
        </p>
        <p>
          Você pode apagar esses dados nas configurações do navegador. A sacola fica vazia e você precisa entrar de
          novo.
        </p>
        <p>
          Se um dia passarmos a usar ferramentas de análise ou de marketing, esta política será atualizada e vamos pedir
          sua permissão antes.
        </p>
      </>
    ),
  },
  {
    id: 'prazo',
    title: 'Por quanto tempo guardamos',
    body: (
      <ul>
        <li>
          <strong>Conta e endereços:</strong> enquanto a conta existir. Se você pedir a exclusão, apagamos ou
          anonimizamos.
        </li>
        <li>
          <strong>Pedidos e dados fiscais:</strong> pelo prazo exigido pela legislação fiscal e de defesa do consumidor,
          em geral 5 anos.
        </li>
        <li>
          <strong>Registros de acesso:</strong> 6 meses, como determina o Marco Civil da Internet (Lei 12.965/2014).
        </li>
      </ul>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos',
    body: (
      <>
        <p>Pela LGPD (art. 18), você pode pedir a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>portabilidade para outro fornecedor;</li>
          <li>informação sobre com quem compartilhamos;</li>
          <li>eliminação dos dados tratados com consentimento e retirada desse consentimento.</li>
        </ul>
        <p>
          Nome, telefone e endereços você mesmo edita em <Link href="/conta">Minha conta</Link>. Para os demais pedidos,
          inclusive excluir a conta, escreva para {email}. Respondemos em até 15 dias. Se não ficar satisfeito, você
          também pode procurar a Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Como protegemos',
    body: (
      <>
        <p>
          O site funciona só com conexão criptografada (HTTPS). No banco, regras de acesso garantem que cada cliente
          veja apenas os próprios dados, e só a equipe autorizada acessa o painel da loja.
        </p>
        <p>
          Nenhum sistema é 100% seguro. Se acontecer um incidente que possa trazer risco a você, avisaremos você e a
          ANPD, como manda a lei.
        </p>
      </>
    ),
  },
  {
    id: 'menores',
    title: 'Crianças e adolescentes',
    body: (
      <p>A loja é voltada a adultos. Menores de 18 anos devem comprar com a ajuda e a autorização de um responsável.</p>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças nesta política',
    body: (
      <p>
        Podemos atualizar esta política quando o site ou a lei mudarem. A data no topo mostra a última versão. Se a
        mudança for importante, avisamos por e-mail ou no próprio site.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidade"
      intro={
        <p>
          Seus dados servem para uma coisa: fazer o chocolate chegar até você. Aqui explicamos, sem juridiquês, o que
          coletamos, por que, com quem compartilhamos e como você controla tudo isso.
        </p>
      }
      sections={sections}
    />
  )
}
