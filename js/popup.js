function toggleApp(app)
{
    chrome.management.setEnabled(app.id, !app.enabled);
}

function loadApp(app)
{
    let selected = "btn-enabled",
        icons    = app.icons,
        icon     = icons[icons.length - 1].url,
        id       = app.id,
        name     = app.name,
        enabled  = app.enabled;

    if (!enabled)
    {
        selected = "btn-light active";
    }

    if(name.length > 20)
    {
        name = name.substring(0, 17)+'...';
    }

    apps_data = "<button type='button' class='btn app-btn btn-secondary " + selected + "' data-id='" + id + "' title='" + name + "'><img class='media-object' src='" + icon + "' height='24' width='24'></button>";

    $("#apps").append(apps_data);
}

function openOptions()
{
    var options_url = chrome.extension.getURL("options.html");
    chrome.tabs.create({ url: options_url });
}

function adjustPopupSize(x, count)
{
    let width  = x * 56,
        height = Math.ceil(count / x) * 46;
    if (x > count)
    {
        width = count * 56;
    }

    if (width > 700)
    {
        width = 672;
    }

    $('body').css({ 'width': width, 'height': height });
    $('html').css({ 'width': width, 'height': height });
}

$(function () {
    $('#apps').on('click', 'button', function () {
        if ($(this).hasClass('show-options'))
        {
            openOptions();
        }
        else
        {
            chrome.management.get($(this).attr('data-id'), toggleApp);
            $(this).toggleClass(['btn-enabled', 'btn-light', 'active']);
        }
    });

    chrome.storage.local.get('selectedApps', (results) => {
        let count = 0;
        if (results.hasOwnProperty('selectedApps'))
        {
            let appArray = results.selectedApps;

            if (appArray != null)
            {
                count = appArray.length;
            }

            if (count === 0)
            {
                $("#apps").append("<button type='button' class='btn btn-default show-options'><i class='fas fa-cog'> Setup</i></button>");
                openOptions();
                count = 2;
            }
            else
            {
                for (let a in appArray)
                {
                    chrome.management.get(appArray[a], loadApp);
                }
            }

        }
        else
        {
            $("#apps").append("<button type='button' class='btn btn-default show-options'><i class='fas fa-cog'> Setup</i></button>");
            openOptions();
            count = 2;
        }

        chrome.storage.local.get('rowSize', (results) => {
            rowSize = 10;
            if (results.hasOwnProperty('rowSize'))
            {
                rowSize = results.rowSize;
            }

            if(rowSize < count)
            {
                $('body').tooltip({
                    container: 'body',
                    placement: 'bottom',
                    selector: '.app-btn',
                    trigger: 'hover'
                });
            }

            adjustPopupSize(rowSize, count);
        });
    });
});
