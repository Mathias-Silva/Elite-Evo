# Plano de Implementação: Modo Claro/Escuro & Favoritos Persistentes

## Descrição

Este plano cobre duas funcionalidades:

1. **Tela de Configurações** acessível pelo ícone de engrenagem no `Profile.js`, contendo um toggle (switch deslizante) para alternar entre **Modo Escuro** (padrão) e **Modo Claro**. A troca deve inverter a paleta de cores de **todas** as telas do app.

2. **Persistência de Favoritos** no SQLite para que os itens favoritos sobrevivam ao reinício do app.

---

## User Review Required

> [!IMPORTANT]
> **Estratégia para inversão de cores**: O app possui **19 telas** e **7 componentes** com cores hardcoded (#000, #FFF, #1A1A1A, etc.). Em vez de converter todos os `StyleSheet.create()` estáticos para dinâmicos (o que seria uma refatoração enorme e frágil), usaremos a estratégia de **hook `useThemeColors()`** que retorna a paleta ativa. Cada componente/tela aplicará as cores via `style={[styles.container, { backgroundColor: colors.background }]}` sobrescrevendo o estático. Isso é **seguro** e **incremental**.

> [!IMPORTANT]
> **Paleta Light Mode**: No modo claro, as cores serão invertidas da seguinte forma:
> | Token | Modo Escuro | Modo Claro |
> |---|---|---|
> | `background` | `#0A0A0A` | `#F5F5F5` |
> | `surface` | `#000000` | `#FFFFFF` |
> | `cardBackground` | `#1A1A1A` | `#FFFFFF` |
> | `secondary` | `#252525` | `#E8E8E8` |
> | `border` | `#1A1A1A` | `#E0E0E0` |
> | `textPrimary` | `#FFFFFF` | `#1A1A1A` |
> | `textSecondary` | `#A0A0A0` | `#666666` |
> | `primary` | `#FF6B00` | `#FF6B00` (sem mudança) |
> | `success` | `#00C853` | `#00C853` (sem mudança) |

> [!WARNING]
> **A preferência de tema será salva no AsyncStorage** (já presente nas dependências) para persistir entre reinicializações. Não usaremos SQLite para isso porque a preferência não está vinculada a um usuário específico do banco.

## Open Questions

> [!NOTE]
> Sem pendências críticas. A tab bar na parte inferior também será temática, ajustando seu `backgroundColor` e `borderTopColor` dinamicamente.

---

## Proposed Changes

### 1. Infraestrutura de Tema

#### [NEW] [ThemeContext.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/context/ThemeContext.js)
- Cria um `ThemeContext` com React Context API.
- Expõe `isDarkMode` (boolean), `toggleTheme()` (função), e `colors` (objeto com a paleta ativa).
- Carrega a preferência salva do `AsyncStorage` na inicialização e persiste ao trocar.
- Define duas paletas completas (`DARK_COLORS` e `LIGHT_COLORS`) cobrindo todos os tokens usados no app.

#### [MODIFY] [theme/index.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/theme/index.js)
- Exportar as paletas `DARK_COLORS` e `LIGHT_COLORS` como constantes adicionais.
- Manter `COLORS` e `SPACING` existentes para compatibilidade (COLORS = DARK_COLORS).

#### [MODIFY] [App.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/App.js)
- Envolver a árvore de componentes com `<ThemeProvider>`.
- Atualizar a StatusBar para mudar dinamicamente entre `light-content` e `dark-content`.

---

### 2. Tela de Configurações

#### [NEW] [Settings.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Settings.js)
- Cabeçalho `ScreenHeader` com título "Configurações".
- Item "Modo Claro" com ícone de sol/lua e `Switch` nativo do React Native à direita.
- O `Switch` usa o estado do `ThemeContext` e chama `toggleTheme()`.
- Visual consistente com a identidade do app (Premium Dark / Light dinâmico).

#### [MODIFY] [navigation/index.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/navigation/index.js)
- Importar `SettingsScreen` e registrar no `ProfileStackNavigator`.
- Aplicar cores dinâmicas do tema à tab bar (`tabBarStyle`).

#### [MODIFY] [Profile.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Profile.js)
- Alterar o `onPress` do ícone de engrenagem para `navigation.navigate("Settings")`.

---

### 3. Aplicação do Tema em Todas as Telas

Cada arquivo abaixo será modificado para:
- Importar `useTheme` de `ThemeContext`.
- Obter `const { colors } = useTheme()` no corpo do componente.
- Sobrescrever cores estáticas com as dinâmicas via `style={[styles.xxx, { backgroundColor: colors.xxx }]}`.

#### Telas a modificar:
- [Home.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Home.js)
- [HomeStyles.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/HomeStyles.js) — Não pode ser dinâmico (é estático). As sobreposições ficam no `Home.js`.
- [Catalog.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Catalog.js)
- [Favorites.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Favorites.js)
- [Cart.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Cart.js)
- [Profile.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Profile.js)
- [Login.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Login.js)
- [Register.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Register.js)
- [AuthHome.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/AuthHome.js)
- [ForgotPassword.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/ForgotPassword.js)
- [Payment.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Payment.js)
- [CheckoutAddress.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/CheckoutAddress.js)
- [Addresses.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Addresses.js)
- [AddressForm.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/AddressForm.js)
- [Orders.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Orders.js)
- [OrderDetails.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/OrderDetails.js)
- [ChangePassword.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/ChangePassword.js)
- [AdminScreen.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/AdminScreen.js)

#### Componentes a modificar:
- [ScreenHeader.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/components/ScreenHeader.js)
- [CategoryCard.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/components/CategoryCard.js)
- [Newsletter.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/components/Newsletter.js)
- [FooterInfo.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/components/FooterInfo.js)

---

### 4. Persistência de Favoritos no SQLite

#### [MODIFY] [initializeDatabase.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/database/initializeDatabase.js)
- Criar tabela `favorites`:
  ```sql
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    UNIQUE(userId, productId),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
  );
  ```

#### [MODIFY] [favoritesSlice.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/store/favoritesSlice.js)
- Adicionar action `setFavorites` (para carregar do banco na inicialização).

#### [MODIFY] [Home.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Home.js)
- No `handleToggleFavorite`: além do dispatch Redux, inserir/deletar no SQLite.
- No `useEffect` de foco: carregar favoritos do banco e despachar `setFavorites`.

#### [MODIFY] [Catalog.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Catalog.js)
- Mesma lógica: sincronizar toggle de favorito com o banco SQLite.

#### [MODIFY] [Favorites.js](file:///c:/Users/Gilberto/Downloads/Elite-Evo/frontend/src/screens/Favorites.js)
- Ao remover favorito: deletar do banco SQLite também.

---

## Verification Plan

### Testes Manuais
1. **Tema**: Acessar Perfil → Engrenagem → Configurações → Toggle de Modo Claro.
   - Verificar se **todas** as telas (Home, Catálogo, Favoritos, Carrinho, Perfil, Pedidos, etc.) inverteram as cores.
   - Fechar e reabrir o app → verificar se o tema persiste.
   - Alternar de volta para Modo Escuro e confirmar a restauração.
2. **Favoritos Persistentes**:
   - Favoritar 2 produtos → Fechar e reabrir o app → Verificar se continuam na aba Favoritos.
   - Desfavoritar um produto → Fechar e reabrir → Verificar se ele não aparece mais.
3. **Tab Bar**: Confirmar que a barra de navegação inferior também muda de cor.
