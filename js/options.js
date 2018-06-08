let appListCache = [];

function getApps(apps)
{
    // Sort apps by name.
    apps.sort(function (x, y) {
        return ((x["name"] === y["name"]) ? 0 : ((x["name"] > y["name"]) ? 1 : -1));
    });

    let apps_data     = [],
        selectedCount = 0;
    for (let a in apps)
    {
        let appTailrID  = chrome.runtime.id,
            id          = apps[a].id,
            icon        = '',
            enabled     = "disabled",
            name        = apps[a].name,
            description = apps[a].description,
            selected    = "",
            icons       = apps[a].icons;

        if (appTailrID !== id)
        {
            if (icons !== null && typeof(icons) !== 'undefined')
            {
                icon = icons[icons.length - 1].url;
            }

            if (checkIfSelected(id))
            {
                selected = "selected";
                selectedCount++;
            }

            if (apps[a].enabled)
            {
                enabled = "enabled";
            }

            apps_data.push(
                "<div class='media app-item " + selected + " " + enabled + "' data-id='" + id + "'>",
                "<img class='align-self-center mr-3' src='" + icon + "' alt='" + name + "' width='48' height='48'>",
                "<div class='media-body'>",
                "<h5 class='mt-0'>" + name + "</h5>",
                "<p>" + description + "</p>",
                "</div>",
                "</div>");
        }
    }

    $('#apps').append(apps_data.join('\n'));
    $('#select-count').text(selectedCount);
}

function saveApps(selectedApps)
{
    chrome.storage.local.set({ 'selectedApps': selectedApps });
}

function checkIfSelected(id)
{

    if (appListCache != null && appListCache.length > 0)
    {
        let indexId = appListCache.indexOf(id);

        return indexId >= 0;
    }
    else
    {
        return false;
    }
}

function removeByValue(arr, id)
{
    arr.splice(arr.indexOf(id), 1);
    return arr;
}

function clearSelected()
{
    chrome.storage.local.remove('selectedApps');
    appListCache = [];

    $('.app-item').each(function () {
        $(this).removeClass('selected');
    });

    $('#select-count').text($('#apps.selected').length);
}

$(function () {
    let version = chrome.app.getDetails().version;

    chrome.storage.local.get('rowSize', (results) => {
        rowSize = 6;
        if (results.hasOwnProperty('rowSize') && results.rowSize > 0)
        {
            rowSize = results.rowSize;
        }

        $("#row-size").slider(
            {
                value: rowSize
            }).on('slideStop', function (e) {
            $('#current-row-size').text(e.value);
            chrome.storage.local.set({ 'rowSize': e.value });
        }).on('slide', function (e) {
            $('#current-row-size').text(e.value);
        });

        $('#current-row-size').text(rowSize);
    });

    chrome.storage.local.get('selectedApps', (appArray) => {
        appListCache = [];
        if (appArray.hasOwnProperty('selectedApps'))
        {
            appListCache = appArray.selectedApps;
        }

        chrome.management.getAll(getApps);
    });

    $('#apps').on('click', '.app-item', function () {
        let appId = $(this).attr('data-id');

        $(this).toggleClass('selected');

        if ($(this).hasClass('selected'))
        {
            appListCache.push(appId);
        }
        else
        {
            appListCache = removeByValue(appListCache, appId);
        }

        $('#select-count').text($('.selected').length);

        saveApps(appListCache);
    });

    $('#clear-selected').click(function () {
        clearSelected();
    });

    $("#version").html("Version: <strong>" + version + "</strong>");
});