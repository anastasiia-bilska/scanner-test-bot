console.log('%cMade by Zakandaiev', 'background:#1db590;color:#fff;padding:10px;font-weight:bold;');

// UTILS
function fadeOut(element, soft = false, callback = null) {
	if(!element) {
		return false;
	}

	element.style.opacity = 1;

	(function fade() {
		if((element.style.opacity -= 0.1) < 0) {
			if(soft) {
				element.style.display = "none";
			} else {
				element.remove();
			}

			if(callback instanceof Function) {
				callback();
			} else if(window[callback] instanceof Function) {
				window[callback]();
			}
		} else {
			requestAnimationFrame(fade);
		}
	})();

}

function showModal(textHeader, textBody = '', modalActions = []) {
	if(!textHeader) {
		return false;
	}

	// MODAL
	const modal = document.createElement('div');
	modal.classList.add('modal');

	// HEADER
	const header = document.createElement('div');
	header.classList.add('modal__header');

	const headerText = document.createElement('span');
	headerText.textContent = textHeader;

	const headerClose = document.createElement('span');
	headerClose.classList.add('modal__close');
	headerClose.innerHTML = SETTING.icon.close;
	headerClose.onclick = (event) => {
		event.preventDefault();
		closeModal(modal);
	};

	header.appendChild(headerText);
	header.appendChild(headerClose);

	// BODY
	const body = document.createElement('div');
	body.classList.add('modal__body');
	body.textContent = textBody;

	// ACTIONS
	const actions = document.createElement('div');
	actions.classList.add('modal__actions');
	modalActions.forEach(action => {
		const button = document.createElement('button');
		button.setAttribute('type', 'button');
		button.classList.add('modal__action');
		if(action.active) button.classList.add('active');
		button.textContent = action.name;
		if(action.callback && action.callback instanceof Function) {
			button.onclick = (event) => {
				action.callback(event);
				closeModal(modal);
			};
		}
		actions.appendChild(button);
	});

	// CRAFT
	modal.appendChild(header);
	if(textBody.length) modal.appendChild(body);
	if(modalActions.length) modal.appendChild(actions);

	// SHOW
	document.body.appendChild(modal);
	document.body.classList.add('modal-open');

	return modal;
}

function closeModal(modal) {
  modal.remove();
  if (document.querySelectorAll('.modal').length <= 0) {
    document.body.classList.remove('modal-open');
  }
}

function showModalInstruction(textHeader, textBody='') {
  	if(!textHeader) {
		return false;
	}

	// MODAL
	const modal = document.createElement('div');
	modal.classList.add('modal');
	modal.classList.add("modal--instruction");

  // MODAL CONTAINER
  const container = document.createElement('div');
  container.classList.add('modal__container');
	// HEADER
	const header = document.createElement('div');
	header.classList.add('modal__header');
	header.classList.add('modal__header--instruction');

	const headerText = document.createElement('span');
	headerText.textContent = textHeader;
  headerText.classList.add('modal__title');

	const headerClose = document.createElement('span');
	headerClose.classList.add('modal__close');
	headerClose.classList.add('modal__close--instruction');
	headerClose.innerHTML = SETTING.icon.close;
	headerClose.onclick = (event) => {
		event.preventDefault();
		closeModal(modal);
	};

	header.appendChild(headerText);
	header.appendChild(headerClose);

	// BODY
	const body = document.createElement('div');
	body.classList.add('modal__body');
	body.classList.add('modal__body--instruction');
	body.innerHTML = textBody;

	// CRAFT
	container.appendChild(header);
	if(textBody.length) container.appendChild(body);
  modal.appendChild(container);

	// SHOW
	document.body.appendChild(modal);
	document.body.classList.add('modal-open');

  const modalHeight = document.querySelector(
    ".modal--instruction"
  ).offsetHeight;
  document.documentElement.style.setProperty(
    "--modal-height",
    `${modalHeight * 0.8}px`
  );

	return modal;
}

window.onload = () => {
	document.querySelectorAll('img').forEach(image => {
		if(image.complete && typeof image.naturalWidth != 'undefined' && image.naturalWidth <= 0) {
			image.src = BASE_URL + '/img/no-image.jpg';
		}
	});
};

function smoothScroll(element) {
	if(element) {
		element.scrollIntoView({
			behavior: 'smooth'
		});
	}
}

function smoothScrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
}

document.addEventListener('click', event => {
	if(event.target.tagName !== 'A') {
		return false;
	}
	const anchor = event.target;
	const anchor_href = anchor.getAttribute('href');

	if(anchor_href === '#') {
		event.preventDefault();
		smoothScrollToTop();
	}
	else if(anchor_href.charAt(0) === '#' || (anchor_href.charAt(0) === '/' && anchor_href.charAt(1) === '#')) {
		if(!anchor.hash) {
			return false;
		}

		const target = document.querySelector(anchor.hash);
		if(target) {
			event.preventDefault();
			smoothScroll(target);
		}
	}
});


document.addEventListener('DOMContentLoaded', () => {
	// PARTIALS
	document.querySelectorAll('a').forEach(anchor => {
	if(anchor.hasAttribute('href') && anchor.href.startsWith('tel:')) {
		anchor.href = 'tel:' + anchor.href.replaceAll(/[^\d+]/g, '');
	}
});

	document.querySelectorAll('a').forEach(anchor => {
	if(anchor.hasAttribute('target') && anchor.getAttribute('target') === '_blank') {
		anchor.setAttribute('rel', 'noopener noreferrer nofollow');
	}
});

	document.addEventListener('contextmenu', event => {
	if(event.target.nodeName === 'IMG') {
		event.preventDefault();
	}
});

	document.querySelectorAll('table').forEach(table => {
	if(!table.parentElement.classList.contains('table-responsive')) {
		table.outerHTML = '<div class="table-responsive">' + table.outerHTML + '</div>';
	}
});

	const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(resource, options) {
  const { timeout = (SETTING.api.timeout ?? 15000) } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });

  clearTimeout(id);

  return response;
}

async function Request(url, options = {}, delay = 0) {
  if (!options.method) {
    options.method = 'POST';
  }

  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json;charset=utf-8'
    };
  }

  if (options.method.toLowerCase() != 'get') {
    if (options.body) {
      options.body = JSON.stringify(options.body);
    } else {
      options.body = JSON.stringify({});
    }
  }

  if (options.showModal !== false) {
    options.showModal = true;
  }

  let data = {}, dataLog = {};

  const startTime = performance.now();

  const response = await fetchWithTimeout(url, options);

  if (response.status === 200) {
    data = await response.json() ?? {};
  }

  dataLog.code = response.status;
  dataLog.text = (response.status === 200) ? 'Успех' : 'Ошибка';

  window.console.log(dataLog)

  if (options.logRequest) {
    LogRequest(dataLog, data);
  }

  const endTime = performance.now();

  const differenceTime = endTime - startTime;

  if (delay > 0 && delay > differenceTime) {
    await sleep(delay - differenceTime);
  } else if (differenceTime < SETTING.api.delay) {
    await sleep(SETTING.api.delay - differenceTime);
  }

  if (response.status !== 200 && options.showModal != false) {
    showModal('Помилка', SETTING.language[appData.language].api_error_alert);
  }

  return data;
}

async function LogRequest(dataLog, data) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  };

  const body = {
    statusCode: dataLog.code,
    message: ''
  };

  if (dataLog.code === 200) {
    const count = data.alcohol.length + data.caffeine.length + data.food.length + data.medicines.length;

    body.message = (count > 0) ? 'found' : 'notfound';
  }
  else {
    body.message = 'API Error';
  }

  options.body = JSON.stringify(body);

  try {
    await fetchWithTimeout(SETTING.api.log, options);

    return true;
  }
  catch (error) {
    console.log(error);

    return false;
  }
}

async function LogRequestInstructions() {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  };

  const body = {
    message: 'Кнопка \'Від виробника\' була натиснута',
  };

  options.body = JSON.stringify(body);

  try {
    await fetchWithTimeout(SETTING.api.logInstructions, options);
  } catch (error) {
    window.console.log(error);
  }
}



	const appData = {
		language: SETTING.defaultLanguage,
		nodeForm: document.querySelector('form'),
		nodeDrug_1: document.querySelector('[name="drug_1"]'),
		nodeDrug_2: document.querySelector('[name="drug_2"]'),
		nodeSumit: document.querySelector('[type="submit"]'),
		nodeReset: document.querySelector('[type="reset"]'),
		nodeTabs: document.querySelector('.tabs'),
		nodeActiveTabNav: document.querySelector('.tabs__item.active'),
		nodeActiveTabSection: document.getElementById('tab-drugs'),
		nodeLangSwitcher: document.querySelector('[data-langswitcher]'),
		drug_1: '',
		drug_2: '',
		activeTab: 'tab-drugs',
		isFetched: false,
		isFetchedDrug2: false,
		isLoading: false,
		isTranslating: false,
		lastFetchedCombination: '',
		drugs: [],
		alcohol: [],
		food: [],
		caffeine: [],
    instructionsAllLang: [],
    instructions: [], //added
		isArticlesRendered: {
			drugs: false,
			alcohol: false,
			food: false,
			caffeine: false,
      instructions: false,
		},
	};

	let updateTimout = null;

	const appProxy = new Proxy(appData, {
		set: function (target, key, value) {
			target[key] = value;

			clearTimeout(updateTimout);

			updateTimout = setTimeout(() => {
				updateElements();
			}, 50);

			return true;
		}
	});

	document.addEventListener('click', (event) => {
  const clear = event.target.closest('[type="reset"]');

  if (!clear) {
    return false;
  }

  event.preventDefault();

  appData.nodeDrug_1.value = '';
  appData.nodeDrug_2.value = '';
  appProxy.drug_1 = '';
  appProxy.drug_2 = '';
});

function updateElements() {
  updateHeader();
  updateBody();
}

function updateHeader() {
  if (appData.drug_1.length > 0) {
    appData.nodeSumit.disabled = false;
  } else {
    appData.nodeSumit.disabled = true;
  }

  if (appData.isFetched) {
    appData.nodeTabs.classList.remove('hidden');
  } else {
    appData.nodeTabs.classList.add('hidden');
  }

  if (
    appData.drug_1 &&
    appData.drug_2 &&
    appData.isFetched &&
    appData.isFetchedDrug2
  ) {
    appData.nodeSumit.classList.add('hidden');
    appData.nodeReset.classList.remove('hidden');
  } else {
    appData.nodeSumit.classList.remove('hidden');
    appData.nodeReset.classList.add('hidden');
  }

  if (EXAMPLE.idx > 0 && !appData.isLoading) {
    document
      .querySelectorAll('[data-example] > [data-show]')
      .forEach((title) => {
        if (
          appData.isFetched &&
          title.getAttribute('data-show') == 'another_example'
        ) {
          title.classList.remove('hidden');
        } else if (
          !appData.isFetched &&
          title.getAttribute('data-show') == 'default'
        ) {
          title.classList.remove('hidden');
        } else {
          title.classList.add('hidden');
        }
      });
  }
}

function updateBody() {
  if (
    appData.isFetched &&
    (appData.drugs.length ||
      appData.alcohol.length ||
      appData.food.length ||
      appData.caffeine.length ||
      appData.instructions.length) //added
  ) {
    appData.nodeLangSwitcher.removeAttribute('disabled');
  } else {
    appData.nodeLangSwitcher.setAttribute('disabled', true);
  }

  if (appData.isLoading) {
    document.body.classList.add('is-loading');
  } else {
    document.body.classList.remove('is-loading');
  }

  const instructions_tab = document.querySelector(
    '[data-target="tab-instructions"]'
  );

  if (appData.instructions.length === 0) {
    instructions_tab.classList.add('hidden');
  } else {
    instructions_tab.classList.remove('hidden');
  }

  document.querySelectorAll('[id^="tab-"]').forEach((tab) => {
    const id = tab.id.replace('tab-', '');
    const titles = tab.querySelectorAll('.section__title');
    const content = tab.querySelector('.section__content');

    if (appData.isLoading) {
      if (id == 'loading') {
        tab.classList.remove('hidden');
      } else {
        tab.classList.add('hidden');
      }
      titles.forEach((title) => {
        if (id == 'loading') {
          if (
            appData.isTranslating &&
            title.getAttribute('data-show') == 'translating'
          ) {
            title.classList.remove('hidden');
          } else if (
            !appData.isTranslating &&
            title.getAttribute('data-show') == 'default'
          ) {
            title.classList.remove('hidden');
          } else {
            title.classList.add('hidden');
          }
        } else {
          title.classList.add('hidden');
        }
      });
      content.innerHTML = '';
      content.classList.add('hidden');
    } else {
      if (id == 'loading') {
        tab.classList.add('hidden');
      }
      if (tab == appData.nodeActiveTabSection) {
        tab.classList.remove('hidden');
      }
    }

    if (appData.isFetched) {
      if (appData[id] && appData[id].length > 0) {
        titles.forEach((title) => title.classList.add('hidden'));

        if (!appData.isArticlesRendered[id]) {
          content.innerHTML = getArticles(id, appData[id]);
          manageIcons();
          appProxy.isArticlesRendered[id] = true;

          if (id === 'instructions') {
            appData.instructions.forEach((info) => {
              const instruction = document.getElementById(
                `instruction-${info.title}`
              );

              instruction.addEventListener('click', function () {
                showModalInstruction(info.title, info.description);
              });
            });
          }
        }
        content.classList.remove('hidden');
      } else {
        titles.forEach((title) => {
          if (id == 'drugs') {
            if (
              !appData.isFetchedDrug2 &&
              title.getAttribute('data-show') == 'input-drug2'
            ) {
              title.classList.remove('hidden');
            } else if (
              appData.isFetchedDrug2 &&
              title.getAttribute('data-show') == 'not-found'
            ) {
              title.classList.remove('hidden');
            } else {
              title.classList.add('hidden');
            }
          } else {
            if (title.getAttribute('data-show') == 'not-found') {
              title.classList.remove('hidden');
            } else {
              title.classList.add('hidden');
            }
          }
        });

        content.classList.add('hidden');
      }
    } else if (!appData.isLoading) {
      titles.forEach((title) => {
        if (id != 'loading') {
          if (title.getAttribute('data-show') == 'default') {
            title.classList.remove('hidden');
          } else {
            title.classList.add('hidden');
          }
        }
      });

      if (appData.drug_1.length <= 0) {
        content.classList.add('hidden');
      }
    }
  });
}

function getArticles(type, articles = []) {
  let output = '';
  if (type === 'instructions') {
    articles.forEach((article) => {
      output += getInstructionArticle(article);
    });
  } else {
    output = `<img class="section__image" src="/img/${type}.jpg" alt="${type}">`;

    articles.forEach((article) => {
      output += getArticle(type, article);
    });
  }

  return output;
}

function getInstructionArticle(article) {
  let title = article.title;
  let description = article.description;

  if (!title) {
    return;
  }

  return `
		<button id="instruction-${article.title}" class="article article--instruction">
        <h3 class="article__header article__header--instruction">${title}</h3>
		</button>
	`;
}

function getArticle(type, data = {}) {
  let title = '',
    more = '',
    moreClass = 'active';

  title = `
    <span>${data.drug_1}</span>
    ${SETTING.icon.comparison}
  `;

  if (type == 'drugs') {
    title += `<span>${data.drug_2}</span>`;
  } else if (type == 'alcohol') {
    title += `<span>${SETTING.language[appData.language]['alcohol']}</span>`;
  } else if (type == 'food') {
    title += `<span>${SETTING.language[appData.language]['food']}</span>`;
  } else if (type == 'caffeine') {
    title += `<span>${SETTING.language[appData.language]['caffeine']}</span>`;
  }

  if (data.text.length > 150) {
    more = `<span class="article__more">${
      SETTING.language[appData.language]['show_more']
    }</span>`;
    moreClass = '';
  }

  return `
		<article class="article">
			<header class="article__header">${title}</header>
			<div class="article__body ${moreClass}">${data.text}</div>
			${more}
			<footer class="article__footer">
				<span>${SETTING.language[appData.language]['source']}:</span>
				<a href="${data.source}" target="_blank">${data.source}</a>
			</footer>
		</article>
	`;
}

	// TABS MOVEMENT AND SCROLL MANIPULATIONS
const rightArrowIcon = document.querySelector(
  '.scrollable-tabs-container__indicator--right svg'
);
const rightArrow = document.querySelector(
  '.scrollable-tabs-container__indicator--right'
);
const leftArrowIcon = document.querySelector(
  '.scrollable-tabs-container__indicator--left svg'
);
const leftArrow = document.querySelector(
  '.scrollable-tabs-container__indicator--left'
);
const tabs = document.querySelectorAll('.tabs__item');
const tabsContainer = document.querySelector('.tabs__wrapper');

function manageIcons() {
  if (tabsContainer.scrollLeft >= 20) {
    leftArrow.classList.add('scrollable-tabs-container__indicator--active');
  } else {
    leftArrow.classList.remove('scrollable-tabs-container__indicator--active');
  }

  const maxScrollValue =
    tabsContainer.scrollWidth - tabsContainer.clientWidth - 20;

  if (tabsContainer.scrollLeft >= maxScrollValue) {
    rightArrow.classList.remove('scrollable-tabs-container__indicator--active');
  } else {
    rightArrow.classList.add('scrollable-tabs-container__indicator--active');
  }
}

rightArrowIcon.addEventListener('click', () => {
  tabsContainer.scrollLeft += 100;
  manageIcons();
});

leftArrowIcon.addEventListener('click', () => {
  tabsContainer.scrollLeft -= 100;
  manageIcons();
});

tabsContainer.addEventListener('scroll', manageIcons);

const firstTab = tabsContainer.firstElementChild;
const lastTab = tabsContainer.lastElementChild;

firstTab.addEventListener('click', () => {
  tabsContainer.scrollLeft = 0;
});

lastTab.addEventListener('click', () => {
  tabsContainer.scrollLeft =
    tabsContainer.scrollWidth - tabsContainer.clientWidth;
});

// TABS STATUS MANIPULATIONS
document.addEventListener('click', (event) => {
  const tab = event.target.closest('.tabs__item');

  if (
    !tab ||
    tab.classList.contains('active') ||
    (document.body.classList.contains('tour') &&
      !document.body.classList.contains('tour_tabs_enable'))
  ) {
    return false;
  }

  tab.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center',
  });

  if (tab.getAttribute('data-target') === 'tab-instructions') {
    LogRequestInstructions();
  }

  document.querySelectorAll('.tabs__item').forEach((tn, i, array) => {
    if (tn == tab) {
      tn.classList.add('active');
      appProxy.activeTab = tn.getAttribute('data-target');
      appProxy.nodeActiveTabNav = tn;

      if (i === 0) {
        tabsContainer.scrollLeft = 0;
      }

      if (i === array.length - 1) {
        tabsContainer.scrollLeft =
          tabsContainer.scrollWidth - tabsContainer.clientWidth;
      }
    } else {
      tn.classList.remove('active');
    }

    manageIcons();
  });

  document.querySelectorAll('[id^="tab-"]').forEach((ts) => {
    if (ts.id == appData.activeTab) {
      ts.classList.remove('hidden');
      appProxy.nodeActiveTabSection = ts;
    } else {
      ts.classList.add('hidden');
    }
  });
});

	document.addEventListener('input', event => {
  const input = event.target;

  if (input != appData.nodeDrug_1 && input != appData.nodeDrug_2) {
    return false;
  }

  const value = input.value;

  input.value = value;

  appProxy[input.name] = value;
});

	const EXAMPLE = {
  idx: 0,
  drug_1: '',
  drug_2: ''
};

document.addEventListener('click', event => {
  const example = event.target.closest('[data-example]');

  if (!example || example.hasAttribute('disabled')) {
    return false;
  }

  if (EXAMPLE.idx in SETTING.examples) {
    const drugs = SETTING.examples[EXAMPLE.idx].split(',', 2);
    EXAMPLE.drug_1 = drugs[0] ?? '';
    EXAMPLE.drug_2 = drugs[1] ?? '';
    EXAMPLE.idx++;
    if(!(EXAMPLE.idx in SETTING.examples)) example.remove();
  } else {
    return false;
  }

  appData.nodeDrug_1.value = EXAMPLE.drug_1;
  appProxy.drug_1 = EXAMPLE.drug_1;
  appData.nodeDrug_2.value = EXAMPLE.drug_2;
  appProxy.drug_2 = EXAMPLE.drug_2;

  setTimeout(() => {
    appData.nodeSumit.click();
  }, 100);
});

	appData.nodeForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  let combination = appData.drug_1;

  if (appData.drug_2.length > 0) {
    combination += ',' + appData.drug_2;
  }

  if (
    combination.length <= 1 ||
    appData.lastFetchedCombination == combination
  ) {
    return false;
  }

  appProxy.isFetched = false;
  appProxy.isLoading = true;
  appProxy.instructionsAllLang = [];
  appProxy.isArticlesRendered.drugs = false;
  appProxy.isArticlesRendered.alcohol = false;
  appProxy.isArticlesRendered.food = false;
  appProxy.isArticlesRendered.caffeine = false;
  appProxy.isArticlesRendered.instructions = false;
  appProxy.lastFetchedCombination = combination;

  if (appData.drug_2.length > 0) {
    appProxy.isFetchedDrug2 = true;
  } else {
    appProxy.isFetchedDrug2 = false;
  }

  const url = `${SETTING.api.compatibility}?DrugName=${encodeURIComponent(
    combination
  )}`;
  const urlInstructions = `${
    SETTING.api.instructions
  }?DrugName=${encodeURIComponent(combination)}`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: 'key urh96611q1itozf6a00h',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    logRequest: true,
  };

  let data = await Request(url, options);

  if (!data) {
    appProxy.drugs = [];
    appProxy.alcohol = [];
    appProxy.food = [];
    appProxy.caffeine = [];
    appProxy.instructions = [];
    appProxy.instructionsAllLang = [];

    appProxy.isFetched = true;
    appProxy.isLoading = false;

    return false;
  }

  data = await formatAnswer(data);
  data = await translateAnswer(data);

  appProxy.drugs = data.drugs;
  appProxy.alcohol = data.alcohol;
  appProxy.food = data.food;
  appProxy.caffeine = data.caffeine;

  const optionsInstructions_drug1 = {
    method: 'POST',
    headers: {
      Authorization: 'key urh96611q1itozf6a00h',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: {
      search: appData.drug_1,
    },
    logRequest: false,
    showModal: true,
  };

  const optionsInstructions_drug2 = {
    method: 'POST',
    headers: {
      Authorization: 'key urh96611q1itozf6a00h',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: {
      search: appData.drug_2,
    },
    logRequest: false,
    showModal: false,
  };

  let dataInsturctions_drug1 = await Request(
    urlInstructions,
    optionsInstructions_drug1
  );

  let dataInsturctions_drug2;

  if (appData.drug_2) {
    dataInsturctions_drug2 = await Request(
      urlInstructions,
      optionsInstructions_drug2
    );
  }

  if (!dataInsturctions_drug1 && !dataInsturctions_drug2) {
    appProxy.instructions = [];

    return false;
  }

  const preparedInstructions = [];

  if (dataInsturctions_drug1) {
    preparedInstructions.push(...prepareInstruction(dataInsturctions_drug1));
  }

  if (dataInsturctions_drug2) {
    preparedInstructions.push(...prepareInstruction(dataInsturctions_drug2));
  }

  function prepareInstruction(originalData) {
    const data = structuredClone(originalData);

    if (!data.data) {
      return [];
    }

    const drugTypes = data.data.data;
    const instructions = data.data.included;
    const prepInst = [];

    drugTypes.forEach((drug) => {
      const drugNameUk =
        drug.attributes.product_brand_series_name_uk ||
        drug.attributes.product_brand_series_name;
      const drugNameRu = drug.attributes.product_brand_series_name_ru;

      const lang = GET_PARAM('language');
      let drugNameDefault;

      if (lang === 'uk') {
        drugNameDefault = drugNameUk;
      } else if (lang === 'ru') {
        drugNameDefault = drugNameRu;
      } else {
        drugNameDefault = null;
      }

      const drugNames = [drugNameDefault, drugNameUk, drugNameRu];

      const hasName = drugNames.some((name) => name);

      if (!hasName) {
        return;
      }

      const drugInstructionId = Array.isArray(
        drug.relationships['product-instruction'].data
      )
        ? drug.relationships['product-instruction'].data[0].id
        : drug.relationships['product-instruction'].data.id;

      const fullInstruction = instructions.find((instruction) => {
        return instruction.id === drugInstructionId;
      });

      if (!fullInstruction) {
        return;
      }

      const drugInstructionDefault =
        fullInstruction.attributes.product_instruction_description_uk ||
        fullInstruction.attributes.product_instruction_description;
      const drugInstructionUk =
        fullInstruction.attributes.product_instruction_description_uk ||
        fullInstruction.attributes.product_instruction_description;
      const drugInstructionRu =
        fullInstruction.attributes.product_instruction_description_ru;

      const drugInstructions = [
        drugInstructionDefault,
        drugInstructionUk,
        drugInstructionRu,
      ];

      const hasInstruction = drugInstructions.some(
        (instruction) => instruction
      );

      if (!hasInstruction) {
        return;
      }

      prepInst.push({
        original: {
          title: drugNameDefault,
          description: drugInstructionDefault,
        },
        uk: {
          title: drugNameUk,
          description: drugInstructionUk,
        },
        ru: {
          title: drugNameRu,
          description: drugInstructionRu,
        },
        en: {
          title: null,
          description: null,
        },
      });
    });

    return prepInst;
  }

  let dataInstructions = [];

  appProxy.instructionsAllLang = preparedInstructions;

  if (preparedInstructions.length > 0) {
    dataInstructions = await translateAnswerInstructions(preparedInstructions);
  }

  appProxy.instructions = dataInstructions;

  let isActiveTabFound = false;
  ['drugs', 'alcohol', 'food', 'caffeine', 'instructions'].forEach((key) => {
    if (!isActiveTabFound && appData[key].length > 0) {
      isActiveTabFound = true;
      appProxy.activeTab = `tab-${key}`;
      document.querySelectorAll('[id^="tab-"]').forEach((tab) => {
        if (tab.id == appData.activeTab) {
          tab.classList.remove('hidden');
          appProxy.nodeActiveTabSection = tab;
        } else {
          tab.classList.add('hidden');
        }
      });
      document.querySelectorAll('[data-target^="tab-"]').forEach((tabNav) => {
        if (tabNav.getAttribute('data-target') == appData.activeTab) {
          tabNav.classList.add('active');
          tabNav.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        } else {
          tabNav.classList.remove('active');
        }
      });
    }
  });

  appProxy.isFetched = true;
  appProxy.isLoading = false;
});

async function formatAnswer(originalData = {}) {
  const data = structuredClone(originalData);

  window.console.log({ original: data });

  delete Object.assign(data, { ['drugs']: data['medicines'] })['medicines'];

  Object.keys(data).forEach((key) => {
    data[key].forEach((answer) => {
      answer.drug_1 = answer.answer.Drug1Name || '';
      answer.drug_2 = answer.answer.Drug2Name || '';
      answer.text = answer.answer.Article || '';
      answer.backupText = answer.answer.Article || '';
    });

    data[key].filter((answer) => !answer.text);
  });

  window.console.log({ after_formatting: data });

  return data;
}

async function translateAnswer(
  originalData = {},
  withoutReloadingPage = false
) {
  const data = structuredClone(originalData);

  if (withoutReloadingPage) {
    appProxy.isFetched = false;
    appProxy.isLoading = true;
    appProxy.isTranslating = true;
    appProxy.isArticlesRendered.drugs = false;
    appProxy.isArticlesRendered.alcohol = false;
    appProxy.isArticlesRendered.food = false;
    appProxy.isArticlesRendered.caffeine = false;
  }

  const count = {
    drugs: 0,
    alcohol: 0,
    food: 0,
    caffeine: 0,
  };

  let texts = [];

  Object.keys(data).forEach((key) => {
    data[key].sort((a, b) => {
      if (a.language != appData.language) {
        return -1;
      }
      if (b.language != appData.language) {
        return 1;
      }
      return 0;
    });

    data[key].forEach((answer) => {
      if (
        appData.language != 'original' &&
        answer.language != appData.language &&
        answer.text.length
      ) {
        count[key] += 1;
        texts.push(answer.text);
      }
    });
  });

  if (texts.length) {
    const url = SETTING.api.translation;

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        q: texts,
        target: appData.language,
      },
      showModal: false,
      timeout: SETTING.api.timeoutTranslation,
    };

    const delay = withoutReloadingPage
      ? SETTING.api.delayTranslation || 2000
      : null;
    const dataTranslate = await Request(url, options, delay);

    let matchedTranslationsCount = 0;
    if (
      dataTranslate?.responseStatus == 'success' &&
      dataTranslate?.responseMessage?.translations?.length
    ) {
      Object.keys(data).forEach((key) => {
        if (count[key] > 0) {
          for (let i = 0; i < count[key]; i++) {
            data[key][i]['text'] =
              dataTranslate.responseMessage.translations[
                i + matchedTranslationsCount
              ].translatedText;
          }
          matchedTranslationsCount += count[key];
        }
      });
    }
  }

  Object.keys(data).forEach((key) => {
    data[key].forEach((answer) => {
      if (
        appData.language == 'original' ||
        answer.language == appData.language
      ) {
        answer.text = answer.backupText;
      }
    });

    data[key].sort((a, b) => {
      if (a.language != appData.language) {
        return 1;
      }
      if (b.language != appData.language) {
        return -1;
      }
      return 0;
    });
  });

  if (withoutReloadingPage) {
    appProxy.drugs = data.drugs;
    appProxy.alcohol = data.alcohol;
    appProxy.food = data.food;
    appProxy.caffeine = data.caffeine;

    appProxy.isFetched = true;
    appProxy.isLoading = false;
    appProxy.isTranslating = false;

    return true;
  }

  return data;
}

async function translateAnswerInstructions(
  originalData = {},
  withoutReloadingPage = false
) {
  let texts = [];
  let count = 0;

  const data = structuredClone(originalData);

  if (withoutReloadingPage) {
    appProxy.isFetched = false;
    appProxy.isLoading = true;
    appProxy.isTranslating = true;
    appProxy.isArticlesRendered.instructions = false;
  }

  data.sort((a, b) => {
    if (!a[appData.language].description) {
      return -1;
    }
    if (!b[appData.language].description) {
      return 1;
    }
    return 0;
  });

  data.forEach((answer) => {
    if (!answer[appData.language].description) {
      count += 1;
      const ref = answer.uk.description
        ? answer.uk.description
        : answer.ru.description;
      texts.push(ref);
    }
  });

  if (texts.length) {
    const url = SETTING.api.translation;

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        q: texts,
        target: appData.language,
      },
      showModal: false,
      timeout: SETTING.api.timeoutTranslation,
    };

    const delay = withoutReloadingPage ? 1000 : null;
    const dataTranslate = await Request(url, options, delay);

    let matchedTranslationsCount = 0;

    if (
      dataTranslate?.responseStatus == 'success' &&
      dataTranslate?.responseMessage?.translations?.length
    ) {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          data[i][appData.language].description =
            dataTranslate.responseMessage.translations[
              i + matchedTranslationsCount
            ].translatedText;
        }
        matchedTranslationsCount += count;
      }
    }
  }

  count = 0;
  texts = [];

  data.sort((a, b) => {
    if (!a.original.title) {
      return -1;
    }
    if (!b.original.title) {
      return 1;
    }
    return 0;
  });

  data.forEach((answer) => {
    if (!answer.original.title) {
      count += 1;
      const ref = answer.uk.title ? answer.uk.title : answer.ru.title;
      texts.push(ref);
    }
  });

  if (texts.length) {
    const url = SETTING.api.translation;
    const lang = GET_PARAM('language');

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        q: texts,
        target: lang || 'uk',
      },
      showModal: false,
      timeout: SETTING.api.timeoutTranslation,
    };

    const delay = withoutReloadingPage ? 1000 : null;
    const dataTranslate = await Request(url, options, delay);

    let matchedTranslationsCount = 0;

    if (
      dataTranslate?.responseStatus == 'success' &&
      dataTranslate?.responseMessage?.translations?.length
    ) {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          data[i].original.title =
            dataTranslate.responseMessage.translations[
              i + matchedTranslationsCount
            ].translatedText;
        }
        matchedTranslationsCount += count;
      }
    }
  }

  const translated =
    data.map((instruction) => {
      if (
        instruction.original.title &&
        instruction[appData.language].description
      ) {
        return {
          title: instruction.original.title,
          description: instruction[appData.language].description,
        };
      }
    }) || [];

  translated.sort((a, b) => {
    if (a.title.includes(appData.drug_1) && !b.title.includes(appData.drug_1)) {
      return -1;
    } else if (!a.title.includes(appData.drug_1) && b.title.includes(appData.drug_1)) {
      return 1;
    }
  });

  if (withoutReloadingPage) {
    appProxy.instructions = translated;

    appProxy.isFetched = true;
    appProxy.isLoading = false;
    appProxy.isTranslating = false;

    return true;
  }

  return translated;
}

	document.addEventListener('click', event => {
  const more = event.target.closest('.article__more');

  if (!more) {
    return false;
  }

  const body = more.closest('.article').querySelector('.article__body');

  body.classList.toggle('active');

  if (body.classList.contains('active')) {
    more.textContent = SETTING.language[appData.language]['show_less'];
  } else {
    more.textContent = SETTING.language[appData.language]['show_more'];
  }
});

	document.addEventListener('click', (event) => {
  const switcher = event.target.closest('[data-langswitcher]');

  if (!switcher || switcher.hasAttribute('disabled')) {
    return false;
  }

  let actions = [];

  Object.keys(SETTING.language).forEach((lang) => {
    actions.push({
      name: SETTING.language[appData.language][lang],
      active: appData.language == lang ? true : false,
      callback: async () => {
        sessionStorage.setItem('language', lang);
        appProxy.language = lang;
        await translateAnswer(
          {
            drugs: appData.drugs,
            alcohol: appData.alcohol,
            food: appData.food,
            caffeine: appData.caffeine,
          },
          true
        );
        await translateAnswerInstructions(appData.instructionsAllLang, true);
        // location.reload();
      },
    });
  });

  showModal(SETTING.language[appData.language]['select_lang'], '', actions);
});

	document.querySelectorAll('[data-lang]').forEach(item => {
  const key = item.getAttribute('data-lang');
  const translation = SETTING.language[appData.language][key] ?? null;

  if (!key && !translation) {
    return false;
  }

  if (item.placeholder && ['input', 'textarea', 'select'].includes(item.tagName.toLocaleLowerCase())) {
    item.placeholder = translation;
  } else {
    item.innerHTML = translation;
  }
});

	class Tour {
	constructor() {
		this.node = {
			item: null,
			rect: {},
			hand: this.createHandNode(),
			box: this.createBoxNode(),
			text: this.createTextNode(),
			step: this.createStepNode(),
			actions: this.createActionsNode(),
			skip: this.createSkipNode(),
			next: this.createNextNode(),
			prev: this.createPrevNode(),
		};

		this.drug_1 = 'Бісопролол';
		this.drug_2 = 'Верапаміл';

		this.step = 0;
		this.prevStep = 0;
		this.maxStep = 8;
		this.canSwitchStep = true;

		this.init();
	}

	init() {
		this.node.actions.appendChild(this.node.skip);
		this.node.actions.appendChild(this.node.prev);
		this.node.actions.appendChild(this.node.next);

		this.node.box.appendChild(this.node.step);
		this.node.box.appendChild(this.node.text);
		this.node.box.appendChild(this.node.actions);

		document.body.appendChild(this.node.hand);
		document.body.appendChild(this.node.box);
		document.body.classList.add('tour');
	}

	async update() {
		if (!this.canSwitchStep) {
			this.step = this.prevStep;
			return false;
		}

		this.canSwitchStep = false;

		this.updateActions();
		this.updateStep();

		await this.updateItem();
		await this.updateText();
		await this.updateHand();

		this.canSwitchStep = true;

		return true;
	}

	resetAppData() {
		appProxy.nodeDrug_1.value = '';
		appProxy.nodeDrug_2.value = '';
		appProxy.drug_1 = '';
		appProxy.drug_2 = '';
		appProxy.isFetched = false;
		appProxy.isFetchedDrug2 = false;
		appProxy.lastFetchedCombination = '';
		appProxy.drugs = [];
		appProxy.alcohol = [];
		appProxy.food = [];
		appProxy.caffeine = [];
		appProxy.isArticlesRendered.drugs = false;
		appProxy.isArticlesRendered.alcohol = false;
		appProxy.isArticlesRendered.food = false;
		appProxy.isArticlesRendered.caffeine = false;
	}

	updateActions() {
		this.node.actions.setAttribute('data-step', this.step);

		if (this.step > 1) {
			this.node.prev.classList.remove('hidden');
		} else {
			this.node.prev.classList.add('hidden');
		}

		if (this.step >= this.maxStep) {
			this.node.next.classList.add('hidden');
			this.node.skip.textContent = SETTING.language[appData.language]['tour_finish'];
		} else {
			this.node.next.classList.remove('hidden');
			this.node.skip.textContent = SETTING.language[appData.language]['tour_skip'];
		}
	}

	async updateItem() {
		if (this.item) {
			if (this.item.hasAttribute('data-tour-remove')) {
				this.item.remove();
			}
			else {
				this.item.classList.remove('tour__item');
			}
		}

		if ((this.step == 5 && this.prevStep == 4) || (this.step == 4 && this.prevStep == 5)) {
			// dont reset
		} else {
			document.querySelectorAll('.section__image, .article').forEach(item => {
				item.classList.remove('tour__item');
			});
		}

		switch (this.step) {
			case 1: {
				this.item = appData.nodeDrug_1;
				break;
			}
			case 2: {
				this.item = appData.nodeDrug_2;
				break;
			}
			case 3: {
				appData.nodeReset.classList.add('hidden');
				appData.nodeSumit.classList.remove('hidden');
				appData.nodeSumit.removeAttribute('disabled');
				this.item = appData.nodeSumit;
				break;
			}
			case 4:
			case 5: {
				this.item = appData.nodeTabs;
				this.item.classList.remove('hidden');

				appProxy.drug_1 = this.drug_1;
				appProxy.drug_2 = this.drug_2;
				appProxy.isFetched = true;
				appProxy.isFetchedDrug2 = true;
				appProxy.lastFetchedCombination = this.drug_1 + ',' + this.drug_2;
				appProxy.drugs = SETTING.tour.drugs;
				appProxy.alcohol = SETTING.tour.alcohol;
				appProxy.food = SETTING.tour.food;
				appProxy.caffeine = SETTING.tour.caffeine;
				appProxy.isArticlesRendered.drugs = false;
				appProxy.isArticlesRendered.alcohol = false;
				appProxy.isArticlesRendered.food = false;
				appProxy.isArticlesRendered.caffeine = false;

				await sleep(51);
				document.querySelectorAll('.section__image').forEach(image => {
					image.classList.remove('hidden');
				});
				document.getElementById('tab-drugs').querySelectorAll('.section__image, .article').forEach(item => {
					item.classList.add('tour__item');
				});

				break;
			}
			case 6: {
				const item = appData.nodeLangSwitcher.cloneNode(true);
				item.removeAttribute('data-langswitcher');
				item.setAttribute('data-tour-remove', true);
				const rect = appData.nodeLangSwitcher.getBoundingClientRect();
				item.style.position = 'fixed';
				item.style.top = `${rect.top}px`;
				item.style.left = `${rect.left}px`;
				document.body.appendChild(item);
				this.item = item;
				this.item.removeAttribute('disabled');
				break;
			}
			case 7: {
				let actions = [];

				Object.keys(SETTING.language).forEach(lang => {
					actions.push({
						name: SETTING.language[appData.language][lang],
						active: (appData.language == lang) ? true : false
					});
				});

				this.item = showModal(SETTING.language[appData.language]['select_lang'], '', actions);

				this.item.setAttribute('data-tour-remove', true);

				this.item.style.zIndex = '401';

				document.body.classList.remove('modal-open');

				break;
			}
			case 8: {
				appProxy.drug_1 = this.drug_1;
				appProxy.drug_2 = this.drug_2;
				appProxy.isFetched = true;
				appProxy.isFetchedDrug2 = true;
				appProxy.lastFetchedCombination = this.drug_1 + ',' + this.drug_2;
				appProxy.drugs = SETTING.tour_translated.drugs;
				appProxy.alcohol = SETTING.tour_translated.alcohol;
				appProxy.food = SETTING.tour_translated.food;
				appProxy.caffeine = SETTING.tour_translated.caffeine;
				appProxy.isArticlesRendered.drugs = false;
				appProxy.isArticlesRendered.alcohol = false;
				appProxy.isArticlesRendered.food = false;
				appProxy.isArticlesRendered.caffeine = false;

				await sleep(151);

				const tabAlcohol = document.getElementById('tab-alcohol');

				tabAlcohol.querySelector('.section__image').classList.add('hidden');

				this.item = tabAlcohol.querySelector('.article');

				tabAlcohol.querySelectorAll('.article').forEach(item => {
					item.classList.add('tour__item');
				});

				break;
			}
			default: {
				this.item = null;
				this.rect = {};
			}
		}

		if (this.item) {
			this.rect = this.item.getBoundingClientRect();
			if (!this.item.classList.contains('modal')) {
				this.item.classList.add('tour__item');
			}
		}
	}

	async updateHand() {
		if (this.step > 0) {
			this.node.hand.classList.add('active');
		} else {
			this.node.hand.classList.remove('active');
		}

		this.node.hand.classList.remove('click');
		this.node.hand.classList.remove('click_bottom');
		this.node.hand.style.transform = '';

		switch (this.step) {
			case 1: {
				this.item.value = '';

				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2 - 5}px`;
				this.node.hand.style.left = `${this.rect.left + 20}px`;
				this.node.hand.style.transform = ``;

				if (this.prevStep == 0) {
					this.node.hand.style.opacity = 0;

					await sleep(100);
					this.node.hand.style.opacity = 1;
				}
				else if (this.prevStep > 1) {
					await sleep(300);
				}

				await sleep(300);
				this.node.hand.classList.add('click');

				await sleep(300);
				this.node.hand.style.top = `${this.rect.bottom + 10}px`;
				this.node.hand.style.left = `${this.node.box.scrollWidth + this.rect.left + 10}px`;

				const word = this.drug_1;
				let n = 0;
				const x = this.item;

				(async function loop() {
					x.value += word[n];
					if (++n < word.length) {
						await sleep(100);
						loop();
					}
				})();

				break;
			}
			case 2: {
				this.item.value = '';

				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2 - 5}px`;
				this.node.hand.style.left = `${this.rect.left + 20}px`;
				this.node.hand.style.transform = ``;

				await sleep(600);
				this.node.hand.classList.add('click');

				await sleep(300);
				this.node.hand.style.top = `${this.rect.bottom + 10}px`;
				this.node.hand.style.left = `${this.node.box.scrollWidth + this.rect.left + 10}px`;

				const word = this.drug_2;
				let n = 0;
				const x = this.item;

				(async function loop() {
					x.value += word[n];
					if (++n < word.length) {
						await sleep(100);
						loop();
					}
				})();

				break;
			}
			case 3: {
				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2 - 5}px`;
				this.node.hand.style.left = `${this.rect.left + this.rect.width / 2 - this.node.hand.scrollWidth / 2 + 20}px`;
				this.node.hand.style.transform = ``;

				await sleep(600);
				this.node.hand.classList.add('click');

				await sleep(300);
				this.node.hand.style.top = `${this.rect.bottom + 10}px`;
				this.node.hand.style.left = `${this.node.box.scrollWidth + this.rect.left + 10}px`;

				break;
			}
			case 4: {
				const drugsTab = document.querySelector('[data-target="tab-drugs"]');
				document.body.classList.add('tour_tabs_enable');
				drugsTab.click();
				document.body.classList.remove('tour_tabs_enable');

				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2 - this.node.hand.scrollHeight}px`;
				this.node.hand.style.left = `calc(${this.rect.left}px + var(--gap))`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				await sleep(900);
				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2 - this.node.hand.scrollHeight}px`;
				this.node.hand.style.left = `calc(${this.rect.width - this.node.hand.scrollWidth}px - var(--gap))`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				await sleep(600);
				this.node.hand.style.top = `${this.rect.top - this.node.hand.scrollHeight - 20}px`;
				this.node.hand.style.left = `calc(${this.node.box.scrollWidth}px + var(--gap) * 2)`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				break;
			}
			case 5: {
				const drugsTab = document.querySelector('[data-target="tab-drugs"]');
				document.body.classList.add('tour_tabs_enable');
				drugsTab.click();
				document.body.classList.remove('tour_tabs_enable');

				const alcoholTab = document.querySelector('[data-target="tab-alcohol"]');
				const alcoholRect = alcoholTab.getBoundingClientRect();

				this.node.hand.style.top = `${alcoholRect.top + alcoholRect.height / 2 - this.node.hand.scrollHeight + 10}px`;
				this.node.hand.style.left = `${alcoholRect.left + alcoholRect.width / 2 - 25}px`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				await sleep(600);
				this.node.hand.classList.add('click_bottom');

				await sleep(600);
				this.node.hand.style.top = `${this.rect.top - this.node.hand.scrollHeight - 20}px`;
				this.node.hand.style.left = `calc(${this.node.box.scrollWidth}px + var(--gap) * 2)`;

				await sleep(600);
				document.body.classList.add('tour_tabs_enable');
				alcoholTab.click();
				document.body.classList.remove('tour_tabs_enable');
				document.getElementById('tab-alcohol').querySelectorAll('.section__image, .article').forEach(item => {
					item.classList.add('tour__item');
				});

				break;
			}
			case 6: {
				this.node.hand.style.top = `${this.rect.top - this.node.hand.scrollHeight + 30}px`;
				this.node.hand.style.left = `${this.rect.left + this.rect.width / 2 - 20}px`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				await sleep(600);
				this.node.hand.classList.add('click_bottom');

				await sleep(600);
				this.node.hand.style.top = `${this.rect.top - this.node.hand.scrollHeight - 20}px`;
				this.node.hand.style.left = `calc(${this.node.box.scrollWidth}px + var(--gap) * 2)`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				break;
			}
			case 7: {
				const langActive = this.item.querySelector('.modal__action.active');
				const langToSwitch = this.item.querySelector('.modal__action:nth-child(3)');
				const langActiveRect = langActive.getBoundingClientRect();
				const langToSwitchRect = langToSwitch.getBoundingClientRect();

				this.node.hand.style.top = `${langActiveRect.top + langActiveRect.height / 2 - 5}px`;
				this.node.hand.style.left = `${langActiveRect.left + 20}px`;
				this.node.hand.style.transform = ``;

				await sleep(900);
				this.node.hand.style.top = `${langActiveRect.top + langActiveRect.height / 2 - 5}px`;
				this.node.hand.style.left = `${langActiveRect.left + langActiveRect.width / 2 - 10}px`;

				await sleep(900);
				this.node.hand.style.top = `${langToSwitchRect.top + langToSwitchRect.height / 2 - 5}px`;
				this.node.hand.style.left = `${langToSwitchRect.left + langToSwitchRect.width / 2 - 10}px`;

				await sleep(900);
				this.node.hand.classList.add('click');

				await sleep(100);
				langActive.classList.remove('active');
				langToSwitch.classList.add('active');

				await sleep(300);
				this.node.hand.style.top = `${this.rect.bottom + 10}px`;
				this.node.hand.style.left = `${this.node.box.scrollWidth + 30}px`;

				break;
			}
			case 8: {
				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2}px`;
				this.node.hand.style.left = `calc(${this.rect.left}px + var(--gap))`;
				this.node.hand.style.transform = ``;

				await sleep(900);
				this.node.hand.style.top = `${this.rect.top + this.rect.height / 2}px`;
				this.node.hand.style.left = `${this.rect.width - this.node.hand.scrollWidth}px`;

				await sleep(900);
				this.node.hand.style.top = `${this.rect.top - this.node.hand.scrollHeight - 20}px`;
				this.node.hand.style.left = `${this.node.box.scrollWidth + this.rect.left + 10}px`;
				this.node.hand.style.transform = `rotate(-134deg)`;

				break;
			}
		}

		if (this.step > 0 && this.step <= this.maxStep) {
			await sleep(600);
		}
	}

	updateStep() {
		this.node.step.textContent = `${this.step}/8`;
	}

	async updateText() {
		if (this.step > 0) {
			this.node.box.classList.add('active');
		} else {
			this.node.box.classList.remove('active');
		}

		switch (this.step) {
			case 1: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_1'];

				this.node.box.style.top = `${this.rect.bottom + 10}px`;
				this.node.box.style.left = `${this.rect.left}px`;

				break;
			}
			case 2: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_2'];

				this.node.box.style.top = `${this.rect.bottom + 10}px`;
				this.node.box.style.left = `${this.rect.left}px`;

				break;
			}
			case 3: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_3'];

				this.node.box.style.top = `${this.rect.bottom + 10}px`;
				this.node.box.style.left = `${this.rect.left}px`;

				break;
			}
			case 4: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_4'];

				this.node.box.style.top = `${this.rect.top - this.node.box.scrollHeight - 10}px`;
				this.node.box.style.left = `var(--gap)`;

				break;
			}
			case 5: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_5'];

				this.node.box.style.top = `${this.rect.top - this.node.box.scrollHeight - 10}px`;
				this.node.box.style.left = `var(--gap)`;

				break;
			}
			case 6: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_6'];

				this.node.box.style.top = `${this.rect.top - this.node.box.scrollHeight - 10}px`;
				this.node.box.style.left = `var(--gap)`;

				break;
			}
			case 7: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_7'];

				this.node.box.style.top = `${this.rect.bottom + 10}px`;
				this.node.box.style.left = `var(--gap)`;

				break;
			}
			case 8: {
				this.node.text.textContent = SETTING.language[appData.language]['tour_step_8'];

				this.node.box.style.top = `${this.rect.top - this.node.box.scrollHeight - 10}px`;
				this.node.box.style.left = `var(--gap)`;

				break;
			}
		}
	}

	createHandNode() {
		const node = document.createElement('div');
		const img = document.createElement('img');

		node.classList.add('tour__hand');
		img.setAttribute('src', '/img/hand.svg');

		node.appendChild(img);

		return node;
	}

	createBoxNode() {
		const node = document.createElement('div');

		node.classList.add('tour__box');

		return node;
	}

	createTextNode() {
		const node = document.createElement('div');

		node.classList.add('tour__text');
		node.textContent = SETTING.language[appData.language]['tour_step_0'];

		return node;
	}

	createStepNode() {
		const node = document.createElement('div');

		node.classList.add('tour__step');
		node.textContent = SETTING.language[appData.language]['tour_name'];

		return node;
	}

	createActionsNode() {
		const node = document.createElement('div');

		node.classList.add('tour__actions');

		return node;
	}

	createSkipNode() {
		const node = document.createElement('span');

		node.classList.add('tour__action');
		node.classList.add('tour__skip');
		node.textContent = SETTING.language[appData.language]['tour_skip'];

		node.addEventListener('click', async (event) => {
			event.preventDefault();

			this.step = 0;

			const result = await this.update();

			if (result) {
				this.resetAppData();

				document.body.classList.remove('tour');

				sessionStorage.setItem('tour-completed', '1');
			}
		});

		return node;
	}

	createNextNode() {
		const node = document.createElement('span');

		node.classList.add('tour__action');
		node.classList.add('tour__next');
		node.innerHTML = '<span>' + SETTING.language[appData.language]['tour_next'] + '</span>&nbsp;' + SETTING.icon.arrowRight;

		node.addEventListener('click', async (event) => {
			event.preventDefault();

			this.prevStep = this.step;
			this.step += 1;

			await this.update();
		});

		return node;
	}

	createPrevNode() {
		const node = document.createElement('span');

		node.classList.add('tour__action');
		node.classList.add('tour__prev');
		node.classList.add('hidden');
		node.innerHTML = SETTING.icon.arrowLeft + '&nbsp;<span>' + SETTING.language[appData.language]['tour_prev'] + '</span>';

		node.addEventListener('click', async (event) => {
			event.preventDefault();

			this.prevStep = this.step;
			this.step -= 1;

			await this.update();
		});

		return node;
	}
}

if (!sessionStorage.getItem('tour-completed')) {
	new Tour();
}

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIkBAaW5jbHVkZSgncGFydGlhbC93YXRlcm1hcmsuanMnKVxuXG4vLyBVVElMU1xuQEBpbmNsdWRlKCd1dGlsL2ZhZGUtb3V0LmpzJylcbkBAaW5jbHVkZSgndXRpbC9tb2RhbC5qcycpXG5AQGluY2x1ZGUoJ3V0aWwvcmVwbGFjZS1icm9rZW4taW1hZ2UuanMnKVxuQEBpbmNsdWRlKCd1dGlsL3Ntb290aC1zY3JvbGwuanMnKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuXHQvLyBQQVJUSUFMU1xuXHRAQGluY2x1ZGUoJ3BhcnRpYWwvZm9ybWF0LXRlbC1saW5rLmpzJylcblx0QEBpbmNsdWRlKCdwYXJ0aWFsL2V4dGVybmFsLWxpbmstbm9yZWZlci5qcycpXG5cdEBAaW5jbHVkZSgncGFydGlhbC9wcm90ZWN0LWltYWdlLmpzJylcblx0QEBpbmNsdWRlKCdwYXJ0aWFsL3Jlc3BvbnNpdmUtdGFibGUuanMnKVxuXHRAQGluY2x1ZGUoJ3BhcnRpYWwvcmVxdWVzdC5qcycpXG5cblx0Y29uc3QgYXBwRGF0YSA9IHtcblx0XHRsYW5ndWFnZTogU0VUVElORy5kZWZhdWx0TGFuZ3VhZ2UsXG5cdFx0bm9kZUZvcm06IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKSxcblx0XHRub2RlRHJ1Z18xOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cImRydWdfMVwiXScpLFxuXHRcdG5vZGVEcnVnXzI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiZHJ1Z18yXCJdJyksXG5cdFx0bm9kZVN1bWl0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbdHlwZT1cInN1Ym1pdFwiXScpLFxuXHRcdG5vZGVSZXNldDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW3R5cGU9XCJyZXNldFwiXScpLFxuXHRcdG5vZGVUYWJzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGFicycpLFxuXHRcdG5vZGVBY3RpdmVUYWJOYXY6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50YWJzX19pdGVtLmFjdGl2ZScpLFxuXHRcdG5vZGVBY3RpdmVUYWJTZWN0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWRydWdzJyksXG5cdFx0bm9kZUxhbmdTd2l0Y2hlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtbGFuZ3N3aXRjaGVyXScpLFxuXHRcdGRydWdfMTogJycsXG5cdFx0ZHJ1Z18yOiAnJyxcblx0XHRhY3RpdmVUYWI6ICd0YWItZHJ1Z3MnLFxuXHRcdGlzRmV0Y2hlZDogZmFsc2UsXG5cdFx0aXNGZXRjaGVkRHJ1ZzI6IGZhbHNlLFxuXHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0aXNUcmFuc2xhdGluZzogZmFsc2UsXG5cdFx0bGFzdEZldGNoZWRDb21iaW5hdGlvbjogJycsXG5cdFx0ZHJ1Z3M6IFtdLFxuXHRcdGFsY29ob2w6IFtdLFxuXHRcdGZvb2Q6IFtdLFxuXHRcdGNhZmZlaW5lOiBbXSxcbiAgICBpbnN0cnVjdGlvbnNBbGxMYW5nOiBbXSxcbiAgICBpbnN0cnVjdGlvbnM6IFtdLCAvL2FkZGVkXG5cdFx0aXNBcnRpY2xlc1JlbmRlcmVkOiB7XG5cdFx0XHRkcnVnczogZmFsc2UsXG5cdFx0XHRhbGNvaG9sOiBmYWxzZSxcblx0XHRcdGZvb2Q6IGZhbHNlLFxuXHRcdFx0Y2FmZmVpbmU6IGZhbHNlLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBmYWxzZSxcblx0XHR9LFxuXHR9O1xuXG5cdGxldCB1cGRhdGVUaW1vdXQgPSBudWxsO1xuXG5cdGNvbnN0IGFwcFByb3h5ID0gbmV3IFByb3h5KGFwcERhdGEsIHtcblx0XHRzZXQ6IGZ1bmN0aW9uICh0YXJnZXQsIGtleSwgdmFsdWUpIHtcblx0XHRcdHRhcmdldFtrZXldID0gdmFsdWU7XG5cblx0XHRcdGNsZWFyVGltZW91dCh1cGRhdGVUaW1vdXQpO1xuXG5cdFx0XHR1cGRhdGVUaW1vdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dXBkYXRlRWxlbWVudHMoKTtcblx0XHRcdH0sIDUwKTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRAQGluY2x1ZGUoJ3BhcnRpYWwvZWxlbWVudHMtdXBkYXRlLmpzJylcblx0QEBpbmNsdWRlKCdwYXJ0aWFsL3RhYnMuanMnKVxuXHRAQGluY2x1ZGUoJ3BhcnRpYWwvZHJ1Z3MtaW5wdXQuanMnKVxuXHRAQGluY2x1ZGUoJ3BhcnRpYWwvZGF0YS1leGFtcGxlLmpzJylcblx0QEBpbmNsdWRlKCdwYXJ0aWFsL2Zvcm0uanMnKVxuXHRAQGluY2x1ZGUoJ3BhcnRpYWwvYXJ0aWNsZS5qcycpXG5cdEBAaW5jbHVkZSgncGFydGlhbC9sYW5nLXN3aXRjaGVyLmpzJylcblx0QEBpbmNsdWRlKCdwYXJ0aWFsL3RyYW5zbGF0aW9uLmpzJylcblx0QEBpbmNsdWRlKCdwYXJ0aWFsL3RvdXIuanMnKVxufSk7XG4iXSwiZmlsZSI6Im1haW4uanMifQ==
