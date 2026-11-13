import type { Metadata } from 'next'
import Link from 'next/link'
import { brand } from '@/config/brand'
import { CompanyLine, LegalPage, type LegalSection } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Termos de uso e compra',
  description: `Regras de compra, entrega, trocas, devoluções e assinatura do clube da ${brand.name}.`,
  alternates: { canonical: '/termos' },
}

const email = <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
const whatsapp = (
  <a href={`https://wa.me/${brand.contact.whatsapp}`} target="_blank" rel="noreferrer">
    WhatsApp {brand.contact.phone}
  </a>
)
const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

// Revisar com a Kaê (prazos, regiões de entrega, trocas) antes de usar em produção
const sections: LegalSection[] = [
  {
    id: 'sobre',
    title: 'Sobre estes termos',
    body: (
      <>
        <p>
          Este site é operado pela <CompanyLine />. Contato: {email} ou {whatsapp}.
        </p>
        <p>
          Ao usar o site, criar uma conta ou fazer um pedido, você concorda com estes termos e com a{' '}
          <Link href="/politica-privacidade">política de privacidade</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'conta',
    title: 'Sua conta',
    body: (
      <ul>
        <li>
          Para comprar ou assinar o clube, é preciso ter 18 anos ou mais (ou comprar com autorização de um responsável)
          e manter os dados de cadastro corretos.
        </li>
        <li>
          O login e a senha são pessoais. Se perceber algum acesso estranho, troque a senha em Minha conta e avise a
          gente.
        </li>
        <li>Podemos suspender contas usadas para fraude ou em desacordo com estes termos.</li>
      </ul>
    ),
  },
  {
    id: 'produtos',
    title: 'Produtos, preços e estoque',
    body: (
      <ul>
        <li>
          Nossos chocolates são feitos em pequenos lotes. As fotos são ilustrativas e podem ter pequenas diferenças de
          cor e embalagem.
        </li>
        <li>
          Os preços estão em reais e podem mudar sem aviso, mas o valor que vale é sempre o mostrado no momento da
          compra.
        </li>
        <li>
          Edições limitadas acabam. Se um item esgotar depois do pagamento, avisamos e você escolhe entre trocar por
          outro sabor ou receber o valor de volta.
        </li>
        <li>
          Se aparecer um preço claramente errado (por exemplo, por erro de digitação), podemos cancelar o pedido e
          devolver o valor pago integralmente.
        </li>
        <li>
          Ingredientes e alérgicos estão na página de cada barra. Em caso de alergia, fale com a gente antes de comprar.
        </li>
      </ul>
    ),
  },
  {
    id: 'pagamento',
    title: 'Pagamento',
    body: (
      <ul>
        <li>
          Os pagamentos são processados pelo Mercado Pago, por Pix ou cartão de crédito, em até{' '}
          {brand.commerce.maxInstallments}x sem juros.
        </li>
        <li>
          O pedido é confirmado quando o pagamento é aprovado. O Pix vale pelo prazo mostrado na hora da compra; depois
          disso o pedido é cancelado automaticamente.
        </li>
        <li>Enviamos a confirmação e as atualizações do pedido para o e-mail da conta.</li>
      </ul>
    ),
  },
  {
    id: 'entrega',
    title: 'Entrega',
    body: (
      <ul>
        <li>
          Entregamos para todo o Brasil. O valor e o prazo do frete aparecem antes de você finalizar a compra. Acima de{' '}
          {brl(brand.commerce.freeShippingFrom)} em produtos, o frete é grátis.
        </li>
        <li>
          O prazo começa a contar depois da confirmação do pagamento. Quando o pedido sai, enviamos o código de
          rastreio.
        </li>
        <li>
          Chocolate é sensível ao calor: embalamos cada pedido para chegar inteiro e, em dias muito quentes, podemos
          segurar o envio por alguns dias, sempre avisando você.
        </li>
        <li>
          Confira o endereço antes de pagar. Se a entrega não acontecer por endereço errado ou ausência de quem recebe,
          o reenvio pode ter custo de frete.
        </li>
      </ul>
    ),
  },
  {
    id: 'arrependimento',
    title: 'Desistência da compra',
    body: (
      <>
        <p>
          Você pode desistir da compra em até 7 dias corridos depois de receber o pedido, sem precisar explicar o motivo
          (art. 49 do Código de Defesa do Consumidor). Devolvemos o valor pago, inclusive o frete.
        </p>
        <p>
          Por se tratar de alimento, para a segurança de todos, as barras precisam voltar lacradas. Para pedir, escreva
          para {email} com o número do pedido. Enviamos as instruções e o código de postagem sem custo para você.
        </p>
        <p>
          O reembolso é feito no mesmo meio de pagamento: no Pix, por transferência; no cartão, por estorno, que aparece
          na fatura conforme o prazo do banco emissor.
        </p>
      </>
    ),
  },
  {
    id: 'problemas',
    title: 'Produto com problema',
    body: (
      <>
        <p>
          Se o pedido chegar derretido, quebrado, violado, com item errado ou faltando, avise em até 30 dias do
          recebimento (art. 26 do Código de Defesa do Consumidor), de preferência com fotos.
        </p>
        <p>Você escolhe: reenviamos o produto, trocamos por outro de mesmo valor ou devolvemos o dinheiro.</p>
      </>
    ),
  },
  {
    id: 'clube',
    title: 'Clube de assinatura',
    body: (
      <ul>
        <li>
          A assinatura renova sozinha ao fim de cada período (mensal, trimestral ou semestral) e é cobrada no cartão
          cadastrado no Mercado Pago.
        </li>
        <li>
          As barras de cada caixa são escolhidas pela Kaê. Se tiver alguma restrição alimentar, informe no cadastro e a
          gente adapta.
        </li>
        <li>
          No plano mensal, você pode pausar ou cancelar quando quiser, sem multa. O cancelamento vale a partir da
          próxima cobrança.
        </li>
        <li>
          Nos planos trimestral e semestral, o cancelamento interrompe a renovação, e você recebe as caixas do período
          já pago.
        </li>
        <li>
          O direito de desistência de 7 dias vale também para a primeira assinatura, nas mesmas condições da seção
          “Desistência da compra”.
        </li>
        <li>
          Se o preço do plano mudar, avisamos por e-mail com pelo menos 30 dias de antecedência. Você pode cancelar
          antes da nova cobrança.
        </li>
      </ul>
    ),
  },
  {
    id: 'presentes',
    title: 'Kits e cartões de presente',
    body: (
      <p>
        Escrevemos à mão o recado que você enviar no kit. Não escrevemos mensagens ofensivas, discriminatórias ou que
        violem direitos de terceiros. Nesses casos, o kit segue sem cartão e avisamos você.
      </p>
    ),
  },
  {
    id: 'propriedade',
    title: 'Marca e conteúdo',
    body: (
      <p>
        A marca {brand.name}, o logo, as embalagens, as fotos e os textos deste site pertencem à {brand.legal.company}.
        Não use sem autorização.
      </p>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças e lei aplicável',
    body: (
      <>
        <p>Podemos atualizar estes termos. A versão que vale para cada pedido é a publicada no dia da compra.</p>
        <p>
          Estes termos seguem a lei brasileira, em especial o Código de Defesa do Consumidor. Qualquer questão pode ser
          levada ao foro do domicílio do consumidor. Antes disso, fale com a gente: quase tudo se resolve com uma boa
          conversa (e um chocolate).
        </p>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de uso e compra"
      intro={
        <p>
          Comprar chocolate tem que ser simples. Aqui estão, de forma direta, as regras de compra, entrega, trocas e do
          clube de assinatura, e o que fazer se algo der errado.
        </p>
      }
      sections={sections}
    />
  )
}
