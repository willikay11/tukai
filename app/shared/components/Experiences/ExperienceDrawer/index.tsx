'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { BookingPanel } from '@/app/(experiences)/experiences/components/BookingPanel';
import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { PlaceDrawerTabs } from '@/app/shared/components/Places/PlaceDrawer/PlaceDrawerTabs';
import { Share } from '@/app/shared/components/Share';
import { useFetchSingleExperience } from '@/app/shared/hooks/useExperiences';
import { useScrollSpy } from '@/app/shared/hooks/useScrollSpy';
import { Drawer } from '@/components/ui/drawer';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { isTicketPaused } from '@/types/ticket';
import { formatExperienceHeaderDate } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';

import { ExperienceDrawerFooter } from './ExperienceDrawerFooter';
import { ExperienceGuestContent } from './ExperienceGuestContent';
import { HostExperiencePanel } from './host/HostExperiencePanel';
import { HOST_TABS, HostTabId } from './host/types';
import { useHostMode } from './host/useHostMode';
import { experienceDrawerTabs } from './tabs';

/** The round grey disc each of the header's controls sits in. */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

/**
 * The header and tab row together, both sticky as one block (ED-02) - unlike
 * the place drawer, nothing here ever swaps the header's title out, so there
 * is no need to pin them independently. Sections clear this with a matching
 * `scroll-mt`.
 */
const TAB_OFFSET = 148;

const Loading = () => (
  <div className="space-y-4 px-6 py-6">
    <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200" />
    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
  </div>
);

/**
 * An experience, opened over whatever the reader was looking at.
 *
 * The drawer shows what a card promises - who runs it, when, where and what it
 * costs - and what it is about. Booking stays on the experience's own page, so
 * the footer sends the reader there rather than duplicating the booking flow.
 */
export const ExperienceDrawer = ({
  experienceId,
  isOpen,
  onClose,
  initialHostTab,
}: {
  experienceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  /** Lands straight on this host tab - the Dashboard's "Tickets created"/"Sold" chips. */
  initialHostTab?: HostTabId;
}) => {
  const { data: session } = useSession();

  // Held in state rather than a ref: the panel only mounts once the drawer
  // opens, and a ref would never tell the scroll spy it had arrived
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  /**
   * Reserving takes the drawer over rather than opening a second one on top
   * of it - the same swap the place drawer uses for Add a review.
   */
  const [view, setView] = useState<'experience' | 'reservation'>('experience');
  // Checkout's own step within the reservation view - BookingPanel owns the
  // flow, but the header's title and the drawer's own back control need to
  // know which half of it is showing
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  useEffect(() => {
    setView('experience');
    setIsCheckingOut(false);
  }, [experienceId]);

  const { data, isLoading, isError } = useFetchSingleExperience(
    isOpen && experienceId ? experienceId : '',
  );
  const experience: Experience | undefined = data?.data;

  // Host mode (ED-host): the drawer's owner sees the host's own tab set
  // (About/Sales/Tickets created/Invited guests/Moments/Analytics) instead
  // of the guest's single-scroll view.
  const isHostMode = Boolean(
    session?.user?.id && experience?.host?.id && session.user.id === experience.host.id,
  );
  const host = useHostMode(experienceId, initialHostTab);

  const hasTickets = (experience?.tickets ?? []).some((ticket) => !isTicketPaused(ticket));
  const hasHost = Boolean(experience?.host || experience?.hostCommunity);
  const isItinerary = experience?.experienceType === 'itinerary';
  const tabs = useMemo(
    () => experienceDrawerTabs(hasTickets, hasHost, isItinerary),
    [hasTickets, hasHost, isItinerary],
  );
  const sectionIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const { activeId, scrollTo } = useScrollSpy(sectionIds, TAB_OFFSET, panel);

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={(next) => !next && onClose()}
      width="wide"
      mobile="full"
      panelRef={setPanel}
    >
      {isError ? (
        <div className="space-y-4 px-6 py-6">
          <p className="text-base text-ink-muted">This experience could not be loaded.</p>
        </div>
      ) : isLoading || !experience ? (
        <Loading />
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-30 bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {(view === 'reservation' || (isHostMode && host.view === 'editTicket')) && (
                  <button
                    type="button"
                    onClick={() =>
                      isHostMode && host.view === 'editTicket'
                        ? host.closeEditTicket()
                        : isCheckingOut
                          ? setIsCheckingOut(false)
                          : setView('experience')
                    }
                    aria-label={
                      isHostMode && host.view === 'editTicket'
                        ? 'Back to Tickets created'
                        : isCheckingOut
                          ? 'Back to Make reservation'
                          : `Back to ${experience.title}`
                    }
                    className={`${DISC} text-brand hover:bg-surface-brand`}
                  >
                    <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
                  </button>
                )}

                <h2 className="min-w-0 truncate text-[26px] font-bold leading-tight text-brand-ink">
                  {view === 'reservation'
                    ? isCheckingOut
                      ? 'Complete your payment'
                      : 'Make reservation'
                    : isHostMode
                      ? host.view === 'editTicket'
                        ? 'Edit ticket details'
                        : experience.title
                      : formatExperienceHeaderDate(experience.startDate, experience.endDate)}
                </h2>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                {view === 'experience' && !(isHostMode && host.view === 'editTicket') && (
                  <>
                    <div className={DISC}>
                      <Share
                        coverPhoto={coverPhotoUrl(experience.photos, 'md') ?? ''}
                        title={experience.title}
                        link={`${process.env.NEXT_PUBLIC_APP_URL}${experiencePath(experience)}`}
                        kind="experience"
                        variant="icon"
                      />
                    </div>

                    <div className={DISC}>
                      <Bookmark
                        bookmarked={experience.isBookmarked}
                        userId={session?.user?.id}
                        experienceId={experience.id}
                        itemName={experience.title}
                        className="text-brand"
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={`Close ${experience.title}`}
                  className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
                >
                  <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
                </button>
              </div>
            </div>

            {view === 'experience' && !isHostMode && (
              <div className="px-6 py-3">
                <PlaceDrawerTabs tabs={tabs} activeId={activeId} onSelect={scrollTo} />
              </div>
            )}

            {isHostMode && host.view === 'tab' && (
              <div className="px-6 py-3">
                <PlaceDrawerTabs
                  tabs={HOST_TABS}
                  activeId={host.hostTab}
                  onSelect={(id) => host.selectTab(id as HostTabId)}
                />
              </div>
            )}
          </div>

          {view === 'reservation' ? (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex items-center gap-3 border-b border-line pb-6">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                  <PhotoImage
                    src={coverPhotoUrl(experience.photos, 'thumb') ?? ''}
                    alt={experience.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-bold text-brand-ink">
                    {experience.title}
                  </p>
                  {(() => {
                    const headerDate = formatExperienceHeaderDate(
                      experience.startDate,
                      experience.endDate,
                    );
                    const [dayLabel, timeLabel] = headerDate?.split(', ') ?? [];

                    return (
                      <p className="flex items-center gap-1.5 text-[14px] text-ink-muted">
                        {dayLabel && <span>{dayLabel}</span>}
                        {dayLabel && timeLabel && (
                          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-dot" />
                        )}
                        {timeLabel && <span>{timeLabel}</span>}
                      </p>
                    );
                  })()}
                </div>
              </div>

              <div className="pt-2">
                <BookingPanel
                  experience={experience}
                  view="reservation"
                  appearance="plain"
                  checkoutOpen={isCheckingOut}
                  onCheckoutOpenChange={setIsCheckingOut}
                  onPurchaseComplete={() => {
                    setIsCheckingOut(false);
                    setView('experience');
                  }}
                />
              </div>
            </div>
          ) : isHostMode ? (
            <HostExperiencePanel
              experience={experience}
              hostTab={host.hostTab}
              view={host.view}
              editingTicket={host.editingTicket}
              onEditTicket={host.openEditTicket}
              onBackFromEdit={host.closeEditTicket}
              onBuyTickets={() => setView('reservation')}
            />
          ) : (
            <>
              <ExperienceGuestContent experience={experience} />

              <ExperienceDrawerFooter
                experience={experience}
                onMakeReservation={() => setView('reservation')}
              />
            </>
          )}
        </div>
      )}
    </Drawer>
  );
};
