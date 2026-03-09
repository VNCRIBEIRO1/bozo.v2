/* ============================================
   CMS ADMIN — JAVASCRIPT
   Gerenciamento completo do site template-v2
   ============================================ */

const CMS = {
    STORAGE_KEY: 'cms_bozo_data',
    AUTH_KEY: 'cms_bozo_auth',
    PASSWORD: 'bozo2026',
    data: null,
    currentSection: 'dashboard',

    /* ───────── INIT ───────── */
    init() {
        this.checkAuth();
        this.bindGlobalEvents();
    },

    /* ───────── AUTH ───────── */
    checkAuth() {
        if (sessionStorage.getItem(this.AUTH_KEY) === 'true') {
            this.showAdmin();
        }
    },

    bindGlobalEvents() {
        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const pw = document.getElementById('loginPassword').value;
            if (pw === this.PASSWORD) {
                sessionStorage.setItem(this.AUTH_KEY, 'true');
                this.showAdmin();
            } else {
                document.getElementById('loginError').textContent = 'Senha incorreta';
                document.getElementById('loginPassword').value = '';
            }
        });

        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => {
            sessionStorage.removeItem(this.AUTH_KEY);
            location.reload();
        });

        // Sidebar nav
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateTo(section);
                // Close mobile sidebar
                document.getElementById('sidebar').classList.remove('open');
            });
        });

        // Mobile sidebar toggle
        document.getElementById('topbarMenu')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        document.getElementById('sidebarClose')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        // Save
        document.getElementById('btnSave')?.addEventListener('click', () => this.saveData());

        // Export
        document.getElementById('btnExport')?.addEventListener('click', () => this.exportData());

        // Import
        document.getElementById('btnImport')?.addEventListener('click', () => {
            document.getElementById('fileImport').click();
        });
        document.getElementById('fileImport')?.addEventListener('change', e => this.importData(e));

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay')?.addEventListener('click', e => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    },

    showAdmin() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminWrapper').style.display = 'flex';
        this.loadData();
        this.navigateTo('dashboard');
    },

    /* ───────── DATA ───────── */
    async loadData() {
        // Try localStorage first
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try { this.data = JSON.parse(stored); return; } catch (e) { /* fall through */ }
        }
        // Load from JSON file
        try {
            const res = await fetch('../data/content.json');
            this.data = await res.json();
            this.saveToStorage();
        } catch (e) {
            this.toast('Erro ao carregar dados. Usando dados padrão.', 'error');
            this.data = this.getDefaultData();
        }
    },

    saveData() {
        this.data.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.toast('Alterações salvas com sucesso!', 'success');
    },

    saveToStorage() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    },

    exportData() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cms-bozo-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast('Backup exportado com sucesso!', 'success');
    },

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported = JSON.parse(reader.result);
                if (!imported.settings && !imported.heroSlides) {
                    throw new Error('Formato inválido');
                }
                this.data = imported;
                this.saveToStorage();
                this.navigateTo(this.currentSection);
                this.toast('Dados importados com sucesso!', 'success');
            } catch (err) {
                this.toast('Arquivo inválido: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    },

    getDefaultData() {
        return { settings: { siteName: 'Wellington Bozo', siteRole: 'Vereador', social: {}, contact: {} }, heroSlides: [], noticias: [], pronunciamentos: [], opinioes: [], videos: [], sobre: { bio: [] }, bandeiras: [], galeria: [], cidade: { facts: [] }, causaAnimal: { hero: { stats: [] }, noticias: [], leis: [], projetos: [], protetores: [], denuncia: { channels: [], tips: [] } }, instagram: [], facebookPost: {} };
    },

    /* ───────── NAVIGATION ───────── */
    navigateTo(section) {
        this.currentSection = section;

        // Update sidebar active
        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === section);
        });

        // Update title
        const titles = {
            dashboard: 'Dashboard', hero: 'Hero / Slides', noticias: 'Notícias',
            pronunciamentos: 'Pronunciamentos', opinioes: 'Opiniões', videos: 'Vídeos',
            sobre: 'Sobre / Biografia', bandeiras: 'Bandeiras de Atuação', galeria: 'Galeria',
            cidade: 'Nossa Cidade', 'animal-noticias': 'Notícias — Causa Animal',
            'animal-leis': 'Leis de Proteção', 'animal-projetos': 'Projetos em Andamento',
            'animal-protetores': 'Protetores & ONGs', 'animal-denuncia': 'Disque Denúncia',
            contato: 'Contato', midia: 'Mídia / Imagens', configuracoes: 'Configurações'
        };
        document.getElementById('topbarTitle').textContent = titles[section] || section;

        // Render content
        this.renderSection(section);
    },

    renderSection(section) {
        const el = document.getElementById('adminContent');
        const renderers = {
            dashboard: () => this.renderDashboard(),
            hero: () => this.renderListSection('heroSlides', { title: 'Slide', fields: ['title','description','image','link'], hasImage: true }),
            noticias: () => this.renderListSection('noticias', { title: 'Notícia', fields: ['title','description','image','link','date'], hasImage: true }),
            pronunciamentos: () => this.renderListSection('pronunciamentos', { title: 'Pronunciamento', fields: ['title','description','image','date','link'], hasImage: true }),
            opinioes: () => this.renderListSection('opinioes', { title: 'Opinião', fields: ['quote','author'], hasImage: false }),
            videos: () => this.renderListSection('videos', { title: 'Vídeo', fields: ['caption','thumbnail','url'], hasImage: true, imageField: 'thumbnail' }),
            sobre: () => this.renderSobre(),
            bandeiras: () => this.renderListSection('bandeiras', { title: 'Bandeira', fields: ['title','description','image','icon'], hasImage: true }),
            galeria: () => this.renderListSection('galeria', { title: 'Foto', fields: ['caption','image'], hasImage: true }),
            cidade: () => this.renderCidade(),
            'animal-noticias': () => this.renderAnimalNoticias(),
            'animal-leis': () => this.renderAnimalLeis(),
            'animal-projetos': () => this.renderAnimalProjetos(),
            'animal-protetores': () => this.renderListSection('causaAnimal.protetores', { title: 'Protetor/ONG', fields: ['name','description','icon','tag'], hasImage: false, nested: true }),
            'animal-denuncia': () => this.renderAnimalDenuncia(),
            contato: () => this.renderContato(),
            midia: () => this.renderMidia(),
            configuracoes: () => this.renderConfiguracoes()
        };
        const renderer = renderers[section];
        if (renderer) el.innerHTML = renderer();
        else el.innerHTML = '<div class="empty-state"><i class="fas fa-cog"></i><h4>Seção em construção</h4></div>';

        this.bindSectionEvents(section);
    },

    /* ───────── DASHBOARD ───────── */
    renderDashboard() {
        const d = this.data;
        const totalSlides = d.heroSlides?.length || 0;
        const totalNoticias = d.noticias?.length || 0;
        const totalOpinioes = d.opinioes?.length || 0;
        const totalLeis = d.causaAnimal?.leis?.length || 0;
        const totalProjetos = d.causaAnimal?.projetos?.length || 0;
        const lastUpdate = d.lastUpdated ? new Date(d.lastUpdated).toLocaleString('pt-BR') : '—';

        return `
        <div class="dash-stats">
            <div class="dash-stat">
                <div class="dash-stat-icon blue"><i class="fas fa-images"></i></div>
                <div><h3>${totalSlides}</h3><span>Slides no Hero</span></div>
            </div>
            <div class="dash-stat">
                <div class="dash-stat-icon green"><i class="fas fa-newspaper"></i></div>
                <div><h3>${totalNoticias}</h3><span>Notícias</span></div>
            </div>
            <div class="dash-stat">
                <div class="dash-stat-icon gold"><i class="fas fa-gavel"></i></div>
                <div><h3>${totalLeis}</h3><span>Leis Registradas</span></div>
            </div>
            <div class="dash-stat">
                <div class="dash-stat-icon purple"><i class="fas fa-project-diagram"></i></div>
                <div><h3>${totalProjetos}</h3><span>Projetos</span></div>
            </div>
            <div class="dash-stat">
                <div class="dash-stat-icon red"><i class="fas fa-quote-left"></i></div>
                <div><h3>${totalOpinioes}</h3><span>Opiniões</span></div>
            </div>
        </div>

        <div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-clock"></i> Última atualização</div>
            <p style="color:var(--text-muted);font-size:0.9rem">${lastUpdate}</p>
        </div>

        <div class="dash-section-title"><i class="fas fa-bolt"></i> Acesso Rápido</div>
        <div class="dash-quick-links">
            <a class="dash-quick-link" data-goto="hero"><i class="fas fa-images"></i> Editar Slides</a>
            <a class="dash-quick-link" data-goto="noticias"><i class="fas fa-newspaper"></i> Notícias</a>
            <a class="dash-quick-link" data-goto="sobre"><i class="fas fa-user"></i> Biografia</a>
            <a class="dash-quick-link" data-goto="animal-leis"><i class="fas fa-gavel"></i> Leis Animais</a>
            <a class="dash-quick-link" data-goto="animal-projetos"><i class="fas fa-project-diagram"></i> Projetos</a>
            <a class="dash-quick-link" data-goto="contato"><i class="fas fa-phone"></i> Contato</a>
            <a class="dash-quick-link" data-goto="configuracoes"><i class="fas fa-cog"></i> Configurações</a>
            <a class="dash-quick-link" data-goto="midia"><i class="fas fa-photo-video"></i> Mídia</a>
        </div>

        <div class="dash-section-title"><i class="fas fa-info-circle"></i> Dicas</div>
        <div class="info-panel">
            <p style="color:var(--text-muted);font-size:0.85rem;line-height:1.8">
                <strong style="color:var(--accent)">💾 Salvar:</strong> Clique em "Salvar" no topo para gravar alterações no navegador.<br>
                <strong style="color:var(--accent)">📤 Exportar:</strong> Faça backup dos dados em JSON para segurança.<br>
                <strong style="color:var(--accent)">📥 Importar:</strong> Restaure dados de um backup JSON anterior.<br>
                <strong style="color:var(--accent)">👁️ Ver Site:</strong> Clique em "Ver Site" na barra lateral para visualizar o site ao vivo.<br>
                <strong style="color:var(--accent)">🔄 Atualizar:</strong> Após salvar, recarregue o site para ver as mudanças aplicadas.
            </p>
        </div>`;
    },

    /* ───────── GENERIC LIST SECTION ───────── */
    renderListSection(dataPath, config) {
        const items = this.getNestedData(dataPath) || [];
        const imageField = config.imageField || 'image';

        let html = `<div class="section-header">
            <h3>${config.title}s <span class="badge">${items.length}</span></h3>
            <button class="btn btn-accent" data-action="add" data-path="${dataPath}">
                <i class="fas fa-plus"></i> Adicionar ${config.title}
            </button>
        </div>`;

        if (!items.length) {
            html += `<div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h4>Nenhum(a) ${config.title.toLowerCase()} cadastrado(a)</h4>
                <p>Clique em "Adicionar" para criar o primeiro item.</p>
            </div>`;
        } else {
            items.forEach((item, idx) => {
                const title = item.title || item.name || item.caption || item.quote?.substring(0, 60) + '...' || `Item ${idx + 1}`;
                const meta = item.date || item.author || item.tag || item.link || '';
                const img = item[imageField] || item.image;
                const thumbHtml = config.hasImage && img
                    ? `<div class="cms-card-thumb"><img src="../${img}" alt="" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\' style=\\'color:var(--text-muted)\\'></i>'"></div>`
                    : '';

                html += `<div class="cms-card" data-index="${idx}">
                    <div class="cms-card-row">
                        <div class="cms-card-drag" title="Arrastar"><i class="fas fa-grip-vertical"></i></div>
                        ${thumbHtml}
                        <div class="cms-card-body">
                            <div class="cms-card-title">${this.escHtml(title)}</div>
                            <div class="cms-card-meta">${this.escHtml(meta)}</div>
                        </div>
                        <div class="cms-card-actions">
                            <button class="btn btn-outline btn-sm" data-action="edit" data-path="${dataPath}" data-index="${idx}" title="Editar">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" data-action="delete" data-path="${dataPath}" data-index="${idx}" title="Excluir">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            });
        }
        return html;
    },

    /* ───────── SOBRE / BIOGRAFIA ───────── */
    renderSobre() {
        const s = this.data.sobre || {};
        return `<div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-user"></i> Dados da Biografia</div>
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Foto de Perfil (caminho)</label>
                    <input class="form-input" id="sobrePhoto" value="${this.escHtml(s.photo || '')}" placeholder="images/bozo-perfil.png">
                    <div class="form-image-preview" id="sobrePhotoPreview">${s.photo ? `<img src="../${s.photo}">` : 'Sem imagem'}</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input class="form-input" id="sobreName" value="${this.escHtml(s.name || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Tag (acima do nome)</label>
                    <input class="form-input" id="sobreTag" value="${this.escHtml(s.tag || '')}">
                </div>
                <div class="form-group full">
                    <label class="form-label">Cargo / Função</label>
                    <input class="form-input" id="sobreRole" value="${this.escHtml((s.role || '').replace(/\n/g, ' | '))}">
                </div>
                <div class="form-group full">
                    <label class="form-label">Biografia (parágrafo 1)</label>
                    <textarea class="form-textarea" id="sobreBio1" rows="4">${this.escHtml(s.bio?.[0] || '')}</textarea>
                </div>
                <div class="form-group full">
                    <label class="form-label">Biografia (parágrafo 2)</label>
                    <textarea class="form-textarea" id="sobreBio2" rows="4">${this.escHtml(s.bio?.[1] || '')}</textarea>
                </div>
            </div>
            <h4 style="margin:20px 0 12px;font-size:0.9rem">Estatísticas</h4>
            ${(s.stats || []).map((st, i) => `
            <div class="form-grid" style="margin-bottom:12px;padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)">
                <div class="form-group"><label class="form-label">Ícone</label><input class="form-input" id="sobreStat${i}Icon" value="${this.escHtml(st.icon || '')}"></div>
                <div class="form-group"><label class="form-label">Valor</label><input class="form-input" id="sobreStat${i}Value" value="${this.escHtml(st.value || '')}"></div>
                <div class="form-group"><label class="form-label">Label</label><input class="form-input" id="sobreStat${i}Label" value="${this.escHtml(st.label || '')}"></div>
                <div class="form-group"><label class="form-label">Animar?</label>
                    <label class="form-toggle"><input type="checkbox" id="sobreStat${i}Counter" ${st.isCounter ? 'checked' : ''}><span class="toggle-track"></span><span class="form-toggle-label">Contador</span></label>
                </div>
            </div>`).join('')}
            <button class="btn btn-accent" id="btnSaveSobre" style="margin-top:16px"><i class="fas fa-save"></i> Salvar Biografia</button>
        </div>`;
    },

    /* ───────── CIDADE ───────── */
    renderCidade() {
        const c = this.data.cidade || {};
        return `<div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-city"></i> Dados da Cidade</div>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Título</label><input class="form-input" id="cidadeTitle" value="${this.escHtml(c.title || '')}"></div>
                <div class="form-group"><label class="form-label">Imagem (caminho)</label><input class="form-input" id="cidadeImage" value="${this.escHtml(c.image || '')}"></div>
                <div class="form-group full"><label class="form-label">Descrição</label><textarea class="form-textarea" id="cidadeDesc" rows="3">${this.escHtml(c.description || '')}</textarea></div>
                <div class="form-group full"><label class="form-label">Legenda da Foto</label><input class="form-input" id="cidadeCaption" value="${this.escHtml(c.imageCaption || '')}"></div>
            </div>
            <h4 style="margin:20px 0 12px;font-size:0.9rem">Dados / Fatos</h4>
            ${(c.facts || []).map((f, i) => `
            <div class="form-grid" style="margin-bottom:8px;padding:12px;background:var(--bg-3);border-radius:var(--radius-sm)">
                <div class="form-group"><label class="form-label">Ícone</label><input class="form-input" id="cidadeFact${i}Icon" value="${this.escHtml(f.icon || '')}"></div>
                <div class="form-group"><label class="form-label">Valor</label><input class="form-input" id="cidadeFact${i}Value" value="${this.escHtml(f.value || '')}"></div>
                <div class="form-group"><label class="form-label">Label</label><input class="form-input" id="cidadeFact${i}Label" value="${this.escHtml(f.label || '')}"></div>
                <div class="form-group"><label class="form-label">Animar?</label>
                    <label class="form-toggle"><input type="checkbox" id="cidadeFact${i}Counter" ${f.isCounter ? 'checked' : ''}><span class="toggle-track"></span><span class="form-toggle-label">Contador</span></label>
                </div>
            </div>`).join('')}
            <button class="btn btn-accent" id="btnSaveCidade" style="margin-top:16px"><i class="fas fa-save"></i> Salvar Cidade</button>
        </div>`;
    },

    /* ───────── ANIMAL NOTÍCIAS ───────── */
    renderAnimalNoticias() {
        return this.renderListSection('causaAnimal.noticias', {
            title: 'Notícia Animal', fields: ['title','description','image','date','badge','link'], hasImage: true, nested: true
        });
    },

    /* ───────── ANIMAL LEIS ───────── */
    renderAnimalLeis() {
        return this.renderListSection('causaAnimal.leis', {
            title: 'Lei', fields: ['title','description','badge','year','icon','link'], hasImage: false, nested: true
        });
    },

    /* ───────── ANIMAL PROJETOS ───────── */
    renderAnimalProjetos() {
        const items = this.data.causaAnimal?.projetos || [];
        let html = `<div class="section-header">
            <h3>Projetos <span class="badge">${items.length}</span></h3>
            <button class="btn btn-accent" data-action="add" data-path="causaAnimal.projetos"><i class="fas fa-plus"></i> Adicionar Projeto</button>
        </div>`;

        items.forEach((item, idx) => {
            html += `<div class="cms-card" data-index="${idx}">
                <div class="cms-card-row">
                    <div class="cms-card-drag"><i class="fas fa-grip-vertical"></i></div>
                    <div class="cms-card-body">
                        <div class="cms-card-title"><i class="${item.icon || 'fas fa-project-diagram'}" style="margin-right:8px;color:var(--accent)"></i>${this.escHtml(item.title)}</div>
                        <div class="cms-card-meta">
                            <span class="cms-card-badge ${item.status === 'active' ? 'active' : ''}">${item.statusText || item.status}</span>
                            &nbsp;•&nbsp; ${item.progress || 0}%
                        </div>
                    </div>
                    <div style="width:120px;margin:0 12px">
                        <div class="form-progress-bar"><div class="form-progress-fill" style="width:${item.progress || 0}%"></div></div>
                    </div>
                    <div class="cms-card-actions">
                        <button class="btn btn-outline btn-sm" data-action="edit" data-path="causaAnimal.projetos" data-index="${idx}"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-danger btn-sm" data-action="delete" data-path="causaAnimal.projetos" data-index="${idx}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>`;
        });

        return html;
    },

    /* ───────── ANIMAL DENÚNCIA ───────── */
    renderAnimalDenuncia() {
        const d = this.data.causaAnimal?.denuncia || {};
        let html = `<div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-exclamation-triangle"></i> Canais de Denúncia</div>`;

        (d.channels || []).forEach((ch, i) => {
            html += `<div class="form-grid" style="margin-bottom:12px;padding:14px;background:var(--bg-3);border-radius:var(--radius-sm)">
                <div class="form-group"><label class="form-label">Ícone</label><input class="form-input" id="denCh${i}Icon" value="${this.escHtml(ch.icon || '')}"></div>
                <div class="form-group"><label class="form-label">Título</label><input class="form-input" id="denCh${i}Title" value="${this.escHtml(ch.title || '')}"></div>
                <div class="form-group"><label class="form-label">Número</label><input class="form-input" id="denCh${i}Number" value="${this.escHtml(ch.number || '')}"></div>
                <div class="form-group"><label class="form-label">Link</label><input class="form-input" id="denCh${i}Link" value="${this.escHtml(ch.link || '')}"></div>
                <div class="form-group full"><label class="form-label">Descrição</label><input class="form-input" id="denCh${i}Desc" value="${this.escHtml(ch.desc || '')}"></div>
            </div>`;
        });

        html += `</div><div class="info-panel" style="margin-top:16px">
            <div class="info-panel-title"><i class="fas fa-lightbulb"></i> Dicas de Denúncia</div>`;

        (d.tips || []).forEach((tip, i) => {
            html += `<div class="form-group"><label class="form-label">Dica ${i+1}</label><input class="form-input" id="denTip${i}" value="${this.escHtml(tip)}"></div>`;
        });

        html += `<button class="btn btn-accent" id="btnSaveDenuncia" style="margin-top:16px"><i class="fas fa-save"></i> Salvar Denúncia</button></div>`;
        return html;
    },

    /* ───────── CONTATO ───────── */
    renderContato() {
        const c = this.data.settings?.contact || {};
        return `<div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-address-book"></i> Informações de Contato</div>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Telefone</label><input class="form-input" id="contatoPhone" value="${this.escHtml(c.phone || '')}"></div>
                <div class="form-group"><label class="form-label">Telefone (raw)</label><input class="form-input" id="contatoPhoneRaw" value="${this.escHtml(c.phoneRaw || '')}"></div>
                <div class="form-group full"><label class="form-label">E-mail</label><input class="form-input" id="contatoEmail" value="${this.escHtml(c.email || '')}"></div>
                <div class="form-group full"><label class="form-label">Endereço</label><textarea class="form-textarea" id="contatoAddress" rows="3">${this.escHtml(c.address || '')}</textarea></div>
                <div class="form-group"><label class="form-label">Horário</label><input class="form-input" id="contatoHours" value="${this.escHtml(c.hours || '')}"></div>
                <div class="form-group"><label class="form-label">WhatsApp (número)</label><input class="form-input" id="contatoWhatsapp" value="${this.escHtml(c.whatsapp || '')}"></div>
            </div>
            <button class="btn btn-accent" id="btnSaveContato" style="margin-top:16px"><i class="fas fa-save"></i> Salvar Contato</button>
        </div>`;
    },

    /* ───────── MÍDIA ───────── */
    renderMidia() {
        const images = [
            'bozo-perfil.png', 'about-bozo.jpg', 'bozo-protetoras.jpg', 'bozo-reuniao.jpg',
            'causa-animal.jpg', 'cta-bg.jpg', 'hero-denuncia-premiada.png',
            'hero-slide-1.jpg', 'hero-slide-2.jpg', 'hero-slide-3.jpg',
            'inclusao.jpg', 'infraestrutura.jpg', 'insta-1.jpg', 'juventude.jpg', 'saude.jpg',
            'Vista_da_Catedral_-_Praça_9_de_Julho_-_Presidente_Prudente_-_SP.jpg'
        ];

        let html = `<div class="section-header">
            <h3>Imagens do Site <span class="badge">${images.length}</span></h3>
            <span style="color:var(--text-muted);font-size:0.85rem">Clique para copiar o caminho</span>
        </div>
        <div class="info-panel" style="margin-bottom:16px">
            <p style="color:var(--text-muted);font-size:0.85rem">
                <i class="fas fa-info-circle" style="color:var(--info)"></i>
                Para adicionar novas imagens, faça upload na pasta <code style="background:var(--bg-3);padding:2px 6px;border-radius:3px">images/</code> do projeto.
                As imagens aparecerão automaticamente aqui.
            </p>
        </div>
        <div class="media-grid">`;

        images.forEach(img => {
            html += `<div class="media-item" data-path="images/${img}" title="Clique para copiar">
                <img src="../images/${img}" alt="${img}" loading="lazy" onerror="this.style.display='none'">
                <div class="media-item-name">${img}</div>
            </div>`;
        });

        html += '</div>';
        return html;
    },

    /* ───────── CONFIGURAÇÕES ───────── */
    renderConfiguracoes() {
        const s = this.data.settings || {};
        const soc = s.social || {};
        return `<div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-cog"></i> Configurações Gerais</div>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Nome do Site</label><input class="form-input" id="cfgSiteName" value="${this.escHtml(s.siteName || '')}"></div>
                <div class="form-group"><label class="form-label">Cargo / Função</label><input class="form-input" id="cfgSiteRole" value="${this.escHtml(s.siteRole || '')}"></div>
                <div class="form-group full"><label class="form-label">Título da Página</label><input class="form-input" id="cfgSiteTitle" value="${this.escHtml(s.siteTitle || '')}"></div>
                <div class="form-group full"><label class="form-label">Descrição (meta)</label><textarea class="form-textarea" id="cfgSiteDesc" rows="2">${this.escHtml(s.siteDescription || '')}</textarea></div>
                <div class="form-group"><label class="form-label">Selo — Anos</label><input class="form-input" id="cfgStampYears" value="${this.escHtml(s.stampYears || '')}"></div>
                <div class="form-group"><label class="form-label">Selo — Texto</label><input class="form-input" id="cfgStampText" value="${this.escHtml(s.stampText || '')}"></div>
                <div class="form-group full">
                    <label class="form-label">Modo Rascunho</label>
                    <label class="form-toggle"><input type="checkbox" id="cfgDraftMode" ${s.draftMode ? 'checked' : ''}><span class="toggle-track"></span><span class="form-toggle-label">Exibir barra de rascunho</span></label>
                </div>
                <div class="form-group full"><label class="form-label">Texto do Rascunho</label><input class="form-input" id="cfgDraftText" value="${this.escHtml(s.draftText || '')}"></div>
            </div>
        </div>

        <div class="info-panel">
            <div class="info-panel-title"><i class="fab fa-instagram"></i> Redes Sociais</div>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Instagram URL</label><input class="form-input" id="cfgInstagram" value="${this.escHtml(soc.instagram || '')}"></div>
                <div class="form-group"><label class="form-label">Instagram @</label><input class="form-input" id="cfgInstagramHandle" value="${this.escHtml(soc.instagramHandle || '')}"></div>
                <div class="form-group"><label class="form-label">Facebook URL</label><input class="form-input" id="cfgFacebook" value="${this.escHtml(soc.facebook || '')}"></div>
                <div class="form-group"><label class="form-label">Facebook Handle</label><input class="form-input" id="cfgFacebookHandle" value="${this.escHtml(soc.facebookHandle || '')}"></div>
                <div class="form-group"><label class="form-label">YouTube URL</label><input class="form-input" id="cfgYoutube" value="${this.escHtml(soc.youtube || '')}"></div>
                <div class="form-group"><label class="form-label">TikTok URL</label><input class="form-input" id="cfgTiktok" value="${this.escHtml(soc.tiktok || '')}"></div>
            </div>
        </div>

        <div class="info-panel">
            <div class="info-panel-title"><i class="fas fa-database"></i> Dados</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-outline" id="btnResetData"><i class="fas fa-undo"></i> Resetar para Padrão</button>
                <button class="btn btn-outline" id="btnClearStorage"><i class="fas fa-trash"></i> Limpar localStorage</button>
            </div>
        </div>

        <button class="btn btn-accent" id="btnSaveConfig" style="margin-top:16px"><i class="fas fa-save"></i> Salvar Configurações</button>`;
    },

    /* ───────── SECTION EVENTS ───────── */
    bindSectionEvents(section) {
        const content = document.getElementById('adminContent');

        // Dashboard quick links
        content.querySelectorAll('[data-goto]').forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                this.navigateTo(el.dataset.goto);
            });
        });

        // Add / Edit / Delete buttons
        content.querySelectorAll('[data-action="add"]').forEach(btn => {
            btn.addEventListener('click', () => this.openItemModal(btn.dataset.path, -1));
        });
        content.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => this.openItemModal(btn.dataset.path, parseInt(btn.dataset.index)));
        });
        content.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteItem(btn.dataset.path, parseInt(btn.dataset.index)));
        });

        // Media items - copy path
        content.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                navigator.clipboard.writeText(path).then(() => {
                    this.toast(`Caminho copiado: ${path}`, 'info');
                });
            });
        });

        // Image preview on input
        content.querySelectorAll('.form-input').forEach(input => {
            if (input.id && (input.id.includes('Photo') || input.id.includes('Image') || input.id.includes('image'))) {
                input.addEventListener('input', () => {
                    const previewId = input.id + 'Preview';
                    const preview = document.getElementById(previewId);
                    if (preview && input.value) {
                        preview.innerHTML = `<img src="../${input.value}" onerror="this.parentElement.innerHTML='Imagem não encontrada'">`;
                    }
                });
            }
        });

        // Section-specific save buttons
        this.bindSaveSobre();
        this.bindSaveCidade();
        this.bindSaveContato();
        this.bindSaveConfig();
        this.bindSaveDenuncia();
    },

    bindSaveSobre() {
        document.getElementById('btnSaveSobre')?.addEventListener('click', () => {
            const s = this.data.sobre;
            s.photo = document.getElementById('sobrePhoto').value;
            s.name = document.getElementById('sobreName').value;
            s.tag = document.getElementById('sobreTag').value;
            s.role = document.getElementById('sobreRole').value.replace(/ \| /g, '\n');
            s.bio = [
                document.getElementById('sobreBio1').value,
                document.getElementById('sobreBio2').value
            ];
            (s.stats || []).forEach((st, i) => {
                st.icon = document.getElementById(`sobreStat${i}Icon`)?.value || st.icon;
                st.value = document.getElementById(`sobreStat${i}Value`)?.value || st.value;
                st.label = document.getElementById(`sobreStat${i}Label`)?.value || st.label;
                st.isCounter = document.getElementById(`sobreStat${i}Counter`)?.checked || false;
            });
            this.saveData();
        });
    },

    bindSaveCidade() {
        document.getElementById('btnSaveCidade')?.addEventListener('click', () => {
            const c = this.data.cidade;
            c.title = document.getElementById('cidadeTitle').value;
            c.image = document.getElementById('cidadeImage').value;
            c.description = document.getElementById('cidadeDesc').value;
            c.imageCaption = document.getElementById('cidadeCaption').value;
            (c.facts || []).forEach((f, i) => {
                f.icon = document.getElementById(`cidadeFact${i}Icon`)?.value || f.icon;
                f.value = document.getElementById(`cidadeFact${i}Value`)?.value || f.value;
                f.label = document.getElementById(`cidadeFact${i}Label`)?.value || f.label;
                f.isCounter = document.getElementById(`cidadeFact${i}Counter`)?.checked || false;
            });
            this.saveData();
        });
    },

    bindSaveContato() {
        document.getElementById('btnSaveContato')?.addEventListener('click', () => {
            const c = this.data.settings.contact;
            c.phone = document.getElementById('contatoPhone').value;
            c.phoneRaw = document.getElementById('contatoPhoneRaw').value;
            c.email = document.getElementById('contatoEmail').value;
            c.address = document.getElementById('contatoAddress').value;
            c.hours = document.getElementById('contatoHours').value;
            c.whatsapp = document.getElementById('contatoWhatsapp').value;
            this.saveData();
        });
    },

    bindSaveConfig() {
        document.getElementById('btnSaveConfig')?.addEventListener('click', () => {
            const s = this.data.settings;
            s.siteName = document.getElementById('cfgSiteName').value;
            s.siteRole = document.getElementById('cfgSiteRole').value;
            s.siteTitle = document.getElementById('cfgSiteTitle').value;
            s.siteDescription = document.getElementById('cfgSiteDesc').value;
            s.stampYears = document.getElementById('cfgStampYears').value;
            s.stampText = document.getElementById('cfgStampText').value;
            s.draftMode = document.getElementById('cfgDraftMode').checked;
            s.draftText = document.getElementById('cfgDraftText').value;
            s.social.instagram = document.getElementById('cfgInstagram').value;
            s.social.instagramHandle = document.getElementById('cfgInstagramHandle').value;
            s.social.facebook = document.getElementById('cfgFacebook').value;
            s.social.facebookHandle = document.getElementById('cfgFacebookHandle').value;
            s.social.youtube = document.getElementById('cfgYoutube').value;
            s.social.tiktok = document.getElementById('cfgTiktok').value;
            this.saveData();
        });

        document.getElementById('btnResetData')?.addEventListener('click', async () => {
            if (!confirm('Tem certeza? Isso vai restaurar os dados originais do JSON.')) return;
            try {
                const res = await fetch('../data/content.json');
                this.data = await res.json();
                this.saveToStorage();
                this.navigateTo(this.currentSection);
                this.toast('Dados resetados para o padrão!', 'success');
            } catch (e) {
                this.toast('Erro ao resetar dados.', 'error');
            }
        });

        document.getElementById('btnClearStorage')?.addEventListener('click', () => {
            if (!confirm('Limpar todos os dados do localStorage?')) return;
            localStorage.removeItem(this.STORAGE_KEY);
            this.toast('localStorage limpo. Recarregue a página.', 'info');
        });
    },

    bindSaveDenuncia() {
        document.getElementById('btnSaveDenuncia')?.addEventListener('click', () => {
            const d = this.data.causaAnimal.denuncia;
            (d.channels || []).forEach((ch, i) => {
                ch.icon = document.getElementById(`denCh${i}Icon`)?.value || ch.icon;
                ch.title = document.getElementById(`denCh${i}Title`)?.value || ch.title;
                ch.number = document.getElementById(`denCh${i}Number`)?.value || ch.number;
                ch.link = document.getElementById(`denCh${i}Link`)?.value || ch.link;
                ch.desc = document.getElementById(`denCh${i}Desc`)?.value || ch.desc;
            });
            (d.tips || []).forEach((tip, i) => {
                d.tips[i] = document.getElementById(`denTip${i}`)?.value || tip;
            });
            this.saveData();
        });
    },

    /* ───────── MODAL — ITEM EDITOR ───────── */
    openItemModal(dataPath, index) {
        const items = this.getNestedData(dataPath) || [];
        const isNew = index === -1;
        const item = isNew ? {} : { ...items[index] };

        const fieldDefs = this.getFieldDefs(dataPath);
        const title = isNew ? 'Adicionar Item' : 'Editar Item';

        let formHtml = '<div class="form-grid">';
        fieldDefs.forEach(f => {
            const val = item[f.key] || '';
            const fullClass = f.fullWidth ? ' full' : '';
            if (f.type === 'textarea') {
                formHtml += `<div class="form-group${fullClass}"><label class="form-label">${f.label}</label><textarea class="form-textarea modal-field" data-key="${f.key}" rows="3">${this.escHtml(Array.isArray(val) ? val.join('\n') : val)}</textarea></div>`;
            } else if (f.type === 'select') {
                formHtml += `<div class="form-group${fullClass}"><label class="form-label">${f.label}</label><select class="form-select modal-field" data-key="${f.key}">${f.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
            } else if (f.type === 'number') {
                formHtml += `<div class="form-group${fullClass}"><label class="form-label">${f.label}</label><input class="form-input modal-field" type="number" data-key="${f.key}" value="${this.escHtml(val)}" min="0" max="100"></div>`;
            } else if (f.type === 'toggle') {
                formHtml += `<div class="form-group${fullClass}"><label class="form-label">${f.label}</label><label class="form-toggle"><input type="checkbox" class="modal-field" data-key="${f.key}" ${val ? 'checked' : ''}><span class="toggle-track"></span><span class="form-toggle-label">${f.toggleLabel || 'Sim'}</span></label></div>`;
            } else if (f.type === 'list') {
                formHtml += `<div class="form-group full"><label class="form-label">${f.label}</label><textarea class="form-textarea modal-field" data-key="${f.key}" data-type="list" rows="4" placeholder="Um item por linha">${this.escHtml(Array.isArray(val) ? val.join('\n') : val)}</textarea><span class="form-hint">Um item por linha</span></div>`;
            } else {
                formHtml += `<div class="form-group${fullClass}"><label class="form-label">${f.label}</label><input class="form-input modal-field" data-key="${f.key}" value="${this.escHtml(val)}"${f.placeholder ? ` placeholder="${f.placeholder}"` : ''}></div>`;
                if (f.key === 'image' || f.key === 'thumbnail') {
                    formHtml += `<div class="form-group${fullClass}"><div class="form-image-preview">${val ? `<img src="../${val}" onerror="this.parentElement.innerHTML='Imagem não encontrada'">` : 'Pré-visualização'}</div></div>`;
                }
            }
        });
        formHtml += '</div>';

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = formHtml;
        document.getElementById('modalFooter').innerHTML = `
            <button class="btn btn-outline" id="modalCancel">Cancelar</button>
            <button class="btn btn-accent" id="modalSave"><i class="fas fa-check"></i> ${isNew ? 'Adicionar' : 'Salvar'}</button>`;

        document.getElementById('modalOverlay').classList.add('open');

        // Bind modal events
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modalSave').addEventListener('click', () => {
            this.saveModalItem(dataPath, index, isNew);
        });
    },

    saveModalItem(dataPath, index, isNew) {
        const fields = document.querySelectorAll('.modal-field');
        const newItem = isNew ? { id: this.genId() } : { ...this.getNestedData(dataPath)[index] };

        fields.forEach(field => {
            const key = field.dataset.key;
            if (field.type === 'checkbox') {
                newItem[key] = field.checked;
            } else if (field.dataset.type === 'list') {
                newItem[key] = field.value.split('\n').filter(l => l.trim());
            } else {
                newItem[key] = field.value;
            }
        });

        const items = this.getNestedData(dataPath);
        if (isNew) {
            items.push(newItem);
        } else {
            items[index] = newItem;
        }

        this.saveToStorage();
        this.closeModal();
        this.renderSection(this.currentSection);
        this.toast(isNew ? 'Item adicionado!' : 'Item atualizado!', 'success');
    },

    deleteItem(dataPath, index) {
        if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return;
        const items = this.getNestedData(dataPath);
        items.splice(index, 1);
        this.saveToStorage();
        this.renderSection(this.currentSection);
        this.toast('Item excluído!', 'success');
    },

    /* ───────── FIELD DEFINITIONS ───────── */
    getFieldDefs(dataPath) {
        const defs = {
            heroSlides: [
                { key: 'title', label: 'Título', type: 'text', fullWidth: true },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'image', label: 'Imagem (caminho)', type: 'text', placeholder: 'images/hero-slide-1.jpg' },
                { key: 'imagePosition', label: 'Posição da Imagem', type: 'text', placeholder: 'center center' },
                { key: 'link', label: 'Link', type: 'text', placeholder: '#seção ou pagina.html' },
                { key: 'linkText', label: 'Texto do Botão', type: 'text' },
                { key: 'active', label: 'Ativo', type: 'toggle', toggleLabel: 'Exibir slide' }
            ],
            noticias: [
                { key: 'title', label: 'Título', type: 'text', fullWidth: true },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'image', label: 'Imagem', type: 'text', placeholder: 'images/nome.jpg' },
                { key: 'imageAlt', label: 'Alt da Imagem', type: 'text' },
                { key: 'link', label: 'Link', type: 'text' },
                { key: 'date', label: 'Data', type: 'text', placeholder: '2026-03-01' }
            ],
            pronunciamentos: [
                { key: 'title', label: 'Título', type: 'text', fullWidth: true },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'image', label: 'Imagem', type: 'text' },
                { key: 'imageAlt', label: 'Alt', type: 'text' },
                { key: 'date', label: 'Data', type: 'text' },
                { key: 'link', label: 'Link', type: 'text' }
            ],
            opinioes: [
                { key: 'quote', label: 'Citação', type: 'textarea', fullWidth: true },
                { key: 'author', label: 'Autor', type: 'text' }
            ],
            videos: [
                { key: 'caption', label: 'Legenda', type: 'text', fullWidth: true },
                { key: 'thumbnail', label: 'Thumbnail (imagem)', type: 'text' },
                { key: 'url', label: 'URL do Vídeo', type: 'text', placeholder: 'https://youtube.com/...' }
            ],
            bandeiras: [
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'icon', label: 'Ícone (Font Awesome)', type: 'text', placeholder: 'fas fa-paw' },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'image', label: 'Imagem', type: 'text' }
            ],
            galeria: [
                { key: 'image', label: 'Imagem', type: 'text', placeholder: 'images/foto.jpg' },
                { key: 'caption', label: 'Legenda', type: 'text', fullWidth: true }
            ],
            'causaAnimal.noticias': [
                { key: 'title', label: 'Título', type: 'text', fullWidth: true },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'image', label: 'Imagem', type: 'text' },
                { key: 'imageAlt', label: 'Alt', type: 'text' },
                { key: 'badge', label: 'Badge', type: 'text', placeholder: 'Destaque, Lei, Reunião' },
                { key: 'badgeType', label: 'Tipo do Badge', type: 'select', options: ['destaque', 'lei', 'reuniao'] },
                { key: 'type', label: 'Tipo', type: 'select', options: ['featured', 'card'] },
                { key: 'date', label: 'Data', type: 'text' },
                { key: 'category', label: 'Categoria', type: 'text' },
                { key: 'link', label: 'Link', type: 'text', fullWidth: true },
                { key: 'linkText', label: 'Texto do Link', type: 'text' },
                { key: 'external', label: 'Link Externo?', type: 'toggle', toggleLabel: 'Abrir em nova aba' }
            ],
            'causaAnimal.leis': [
                { key: 'title', label: 'Título', type: 'text', fullWidth: true },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'badge', label: 'Badge', type: 'text', placeholder: 'Aprovado, Emenda' },
                { key: 'badgeType', label: 'Tipo', type: 'select', options: ['approved', 'emenda'] },
                { key: 'year', label: 'Ano', type: 'text' },
                { key: 'icon', label: 'Ícone', type: 'text', placeholder: 'fas fa-paw' },
                { key: 'link', label: 'Link', type: 'text', fullWidth: true },
                { key: 'featured', label: 'Destaque?', type: 'toggle', toggleLabel: 'Card destacado' },
                { key: 'details', label: 'Detalhes (um por linha)', type: 'list' }
            ],
            'causaAnimal.projetos': [
                { key: 'title', label: 'Título', type: 'text', fullWidth: true },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'icon', label: 'Ícone', type: 'text', placeholder: 'fas fa-syringe' },
                { key: 'status', label: 'Status', type: 'select', options: ['active', 'planned', 'completed'] },
                { key: 'statusText', label: 'Texto do Status', type: 'text', placeholder: 'Em execução' },
                { key: 'progress', label: 'Progresso (%)', type: 'number' },
                { key: 'progressText', label: 'Texto do Progresso', type: 'text', placeholder: '72% da meta' }
            ],
            'causaAnimal.protetores': [
                { key: 'name', label: 'Nome', type: 'text' },
                { key: 'icon', label: 'Ícone', type: 'text', placeholder: 'fas fa-paw' },
                { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true },
                { key: 'tag', label: 'Tag', type: 'text', placeholder: 'ONG, Independente, Voluntários' }
            ]
        };
        return defs[dataPath] || [
            { key: 'title', label: 'Título', type: 'text', fullWidth: true },
            { key: 'description', label: 'Descrição', type: 'textarea', fullWidth: true }
        ];
    },

    /* ───────── UTILITIES ───────── */
    getNestedData(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.data);
    },

    genId() {
        return 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    },

    escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('open');
    },

    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icons[type]} toast-icon"></i><span class="toast-msg">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};

/* ───────── BOOT ───────── */
document.addEventListener('DOMContentLoaded', () => CMS.init());
