import { createRouter, createWebHistory } from "vue-router";
import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import AppLayout from "@/layout/AppLayout.vue";
import { authService } from "@/services";
import { getUserInfo } from "@/utils/helpers";
import { ROLES } from "@/constants/roles";

const getUserSession = () => {
  const session = getUserInfo();
  return {
    session,
    clubId: session?.clubId ?? null,
    userId: session?.userId ?? null,
    userRole: session?.roles?.[0] ?? null,
  };
};

const validatePasswordTokenGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = to.query.token as string;
  const email = to.query.email as string;
  if (!token || !email) {
    next({ name: "notfound" });
    return;
  }

  try {
    const response = await authService.validatePasswordToken({
      token: token.replace(/ /g, "+"),
      email,
    });

    if (response.success) {
      const { data } = response;
      if (data.hasPassword && data.isValid) {
        next();
      } else if (data.hasPassword && !data.isValid) {
        next({ name: "alreadyCreated" });
      } else if (!data.isValid)
        next({
          name: "linkExpired",
          query: {
            email,
          },
        });
      else next();
    } else {
      next({ name: "login" });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    next({ name: "login" });
  }
};

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/views/Dashboard/Dashboard.vue"),
          beforeEnter: (_to, _from, next) => {
            const { userId, userRole, clubId } = getUserSession();

            if (userRole === ROLES.CLUB_ADMIN && userId) {
              next(`/pages/club/dashboard/${clubId}`);
              return;
            }
            next();
          },
          meta: {
            title: "Dashboard",
            breadcrumbTitle: "Dashboard",
            roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
            requiresAuth: true,
          },
        },
        {
          path: "pages",
          children: [
            {
              path: "users",
              children: [
                {
                  path: "",
                  name: "users",
                  component: () => import("@/views/pages/Users/UsersList.vue"),
                  meta: {
                    title: "Gebruikerslijst",
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "adduser",
                  component: () =>
                    import("@/views/pages/Users/AddEditUser.vue"),
                  meta: {
                    title: "Gebruiker toevoegen",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "edituser",
                  component: () =>
                    import("@/views/pages/Users/AddEditUser.vue"),
                  meta: {
                    title: "Gebruiker bewerken",
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Users",
                breadcrumbTitle: "Users.title",
                roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
                requiresAuth: true,
              },
            },
            {
              path: "club",
              children: [
                {
                  path: "",
                  name: "club",
                  component: () => import("@/views/pages/Clubs/ClubList.vue"),
                  meta: {
                    title: "Clublijst",
                    roles: [ROLES.SUPER_ADMIN],
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "addclub",
                  component: () => import("@/views/pages/Clubs/AddClub.vue"),
                  meta: {
                    title: "Club toevoegen",
                    roles: [ROLES.SUPER_ADMIN],
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "editclub",
                  component: () => import("@/views/pages/Clubs/EditClub.vue"),
                  meta: {
                    title: "Club bewerken",
                    roles: [ROLES.SUPER_ADMIN],
                    requiresAuth: true,
                  },
                },
                {
                  path: "dashboard/:id",
                  name: "clubdashboard",
                  component: () =>
                    import("@/views/pages/Clubs/ClubDashboard.vue"),
                  meta: {
                    title: "Club dashboard",
                    roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Clubs",
                breadcrumbTitle: "Clubs.title",
                requiresAuth: true,
              },
            },
            {
              path: "federation",
              children: [
                {
                  path: "",
                  name: "federation",
                  component: () =>
                    import("@/views/pages/Federation/FederationList.vue"),
                  meta: {
                    title: "Federatielijst",
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "addfederation",
                  component: () =>
                    import("@/views/pages/Federation/AddEditFederation.vue"),
                  meta: {
                    title: "Federatie toevoegen",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "editfederation",
                  component: () =>
                    import("@/views/pages/Federation/AddEditFederation.vue"),
                  meta: {
                    title: "Federatie bewerken",
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Federation",
                breadcrumbTitle: "Management.title",
                pageTitle: "Management.federations.title",
                roles: [ROLES.SUPER_ADMIN],
                requiresAuth: true,
              },
            },
            {
              path: "supplier",
              children: [
                {
                  path: "",
                  name: "supplier",
                  component: () =>
                    import("@/views/pages/Supplier/SupplierList.vue"),
                  meta: {
                    title: "Supplierlijst",
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "addsupplier",
                  component: () =>
                    import("@/views/pages/Supplier/AddEditSupplier.vue"),
                  meta: {
                    title: "Supplier toevoegen",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "editsupplier",
                  component: () =>
                    import("@/views/pages/Supplier/AddEditSupplier.vue"),
                  meta: {
                    title: "Supplier bewerken",
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Supplier",
                breadcrumbTitle: "Management.title",
                pageTitle: "Management.suppliers.title",
                roles: [ROLES.SUPER_ADMIN],
                requiresAuth: true,
              },
            },
            {
              path: "ageCategory",
              children: [
                {
                  path: "",
                  name: "ageCategory",
                  component: () =>
                    import("@/views/pages/AgeCategory/AgeCategoryList.vue"),
                  meta: {
                    title: "Leeftijdsgroepenlijst",
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "addageCategory",
                  component: () =>
                    import("@/views/pages/AgeCategory/AddEditAgeCategory.vue"),
                  meta: {
                    title: "Leeftijdsgroep toevoegen",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "editageCategory",
                  component: () =>
                    import("@/views/pages/AgeCategory/AddEditAgeCategory.vue"),
                  meta: {
                    title: "Leeftijdsgroep bewerken",
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Leeftijdsgroepen",
                breadcrumbTitle: "Management.title",
                pageTitle: "Management.ageCategories.title",
                roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
                requiresAuth: true,
              },
            },
            {
              path: "team",
              children: [
                {
                  path: "",
                  name: "team",
                  component: () => import("@/views/pages/Team/TeamList.vue"),
                  meta: {
                    title: "Teamljst",
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "addteam",
                  component: () => import("@/views/pages/Team/AddEditTeam.vue"),
                  meta: {
                    title: "Team toevoegen",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "editteam",
                  component: () => import("@/views/pages/Team/AddEditTeam.vue"),
                  meta: {
                    title: "Team bewerken",
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Teams",
                breadcrumbTitle: "Management.title",
                pageTitle: "Management.teams.title",
                roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
                requiresAuth: true,
              },
            },
            {
              path: "learningLines",
              children: [
                {
                  path: "",
                  name: "learningLines",
                  component: () =>
                    import("@/views/pages/LearningLines/LearningLineList.vue"),
                  meta: {
                    title: "Learning Lines",
                    requiresAuth: true,
                  },
                },
                {
                  path: "add",
                  name: "addLearningLine",
                  component: () =>
                    import("@/views/pages/LearningLines/AddEditLearningLine.vue"),
                  meta: {
                    title: "Add Learning Line",
                    requiresAuth: true,
                  },
                },
                {
                  path: "weeklyPlan/:id",
                  name: "learningLineWeeklyPlan",
                  component: () =>
                    import("@/views/pages/LearningLines/AddEditLearningLine.vue"),
                  meta: {
                    title: "Weekly Plan",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:id",
                  name: "editLearningLine",
                  component: () =>
                    import("@/views/pages/LearningLines/AddEditLearningLine.vue"),
                  meta: {
                    title: "Edit Learning Line",
                    requiresAuth: true,
                  },
                },
                {
                  path: "dashboard/:id",
                  name: "learningLineDashboard",
                  component: () =>
                    import("@/views/pages/LearningLines/LearningLineDashboard.vue"),
                  meta: {
                    title: "Learning Line Dashboard",
                    requiresAuth: true,
                  },
                },
                {
                  path: "edit/:learningLineId/week/:weekId",
                  name: "learningLineWeekContent",
                  component: () =>
                    import("@/views/pages/LearningLines/LearningLineWeekContent.vue"),
                  meta: {
                    title: "Week Content",
                    requiresAuth: true,
                  },
                },
              ],
              meta: {
                title: "Learning Lines",
                breadcrumbTitle: "Academy.title",
                pageTitle: "Academy.LearningLines.title",
                roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
                requiresAuth: true,
              },
            },
            {
              path: "library",
              children: [
                {
                  path: "",
                  name: "library",
                  component: () =>
                    import("@/views/pages/Library/LibraryList.vue"),
                },
                {
                  path: "add",
                  name: "addlibrary",
                  component: () =>
                    import("@/views/pages/Library/AddEditContent.vue"),
                },
                {
                  path: "edit/:id/:type",
                  name: "editlibrary",
                  component: () =>
                    import("@/views/pages/Library/AddEditContent.vue"),
                },
                {
                  path: "editCourse",
                  children: [
                    {
                      path: ":id/:type",
                      name: "editcourse",
                      component: () =>
                        import("@/views/pages/Library/AddEditContent.vue"),
                    },
                    {
                      path: ":id/:type/module/:moduleId",
                      name: "editcoursemodule",
                      component: () =>
                        import("@/views/pages/Library/AddEditContent.vue"),
                    },
                    {
                      path: ":id/:type/addlessons/:moduleId",
                      name: "addlessons",
                      component: () =>
                        import("@/views/pages/Library/AddEditContent.vue"),
                    },
                    {
                      path: ":id/:type/lesson/:lessonId",
                      name: "editcourselesson",
                      component: () =>
                        import("@/views/pages/Library/AddEditContent.vue"),
                    },
                    {
                      path: ":id/:type/file/:fileId",
                      name: "editcoursefile",
                      component: () =>
                        import("@/views/pages/Library/AddEditContent.vue"),
                    },
                  ],
                },
                {
                  path: "editFile/:id/:type",
                  name: "editfile",
                  component: () =>
                    import("@/views/pages/Library/AddEditContent.vue"),
                },
                {
                  path: "addFile/:id/:type",
                  name: "addfile",
                  component: () =>
                    import("@/views/pages/Library/AddEditContent.vue"),
                },
                {
                  path: "detail/:id/:type",
                  name: "contentdetail",
                  component: () =>
                    import("@/views/pages/Library/ContentDetail.vue"),
                },
              ],
              meta: {
                title: "Library",
                breadcrumbTitle: "Academy.title",
                pageTitle: "Academy.library.title",
                roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
                requiresAuth: true,
              },
            },
          ],
        },
      ],
    },
    {
      path: "/auth",
      component: () => import("@/views/pages/auth/Auth.vue"),
      children: [
        {
          path: "login",
          name: "login",
          component: () => import("@/views/pages/auth/Login.vue"),
          meta: {
            title: "Login",
            requiresAuth: false,
          },
        },
        {
          path: "create-password",
          name: "createPassword",
          component: () => import("@/views/pages/auth/CreateResetPassword.vue"),
          beforeEnter: validatePasswordTokenGuard,
          meta: {
            title: "Create Password",
            requiresAuth: false,
          },
        },
        {
          path: "forgot-password",
          name: "forgotPassword",
          component: () => import("@/views/pages/auth/ForgotPassword.vue"),
          meta: {
            title: "Wachtwoord vergeten",
            requiresAuth: false,
          },
        },
        {
          path: "reset-password",
          name: "resetPassword",
          component: () => import("@/views/pages/auth/CreateResetPassword.vue"),
          beforeEnter: validatePasswordTokenGuard,
          meta: {
            title: "Reset Password",
            requiresAuth: false,
          },
        },
        {
          path: "link-expired",
          name: "linkExpired",
          component: () => import("@/views/pages/auth/LinkExpired.vue"),
        },
        {
          path: "already-created",
          name: "alreadyCreated",
          component: () => import("@/views/pages/auth/AlreadyCreated.vue"),
        },
        {
          path: "notfound",
          name: "notfound",
          component: () => import("@/views/pages/auth/NotFound.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "auth/notfound",
    },
  ],
});

router.beforeEach((to, _, next) => {
  const { userId, userRole } = getUserSession();

  if (to.meta.requiresAuth) {
    if (!userId || !userRole) {
      next("/auth/login");
      return;
    }

    const rolesToCheck =
      to.meta.roles ||
      to.matched.find((route) => route.meta?.roles)?.meta?.roles;

    if (rolesToCheck && !rolesToCheck.includes(userRole)) {
      next("/auth/notfound");
      return;
    }
    next();
    return;
  }

  if (to.path === "/auth/login" && userId) {
    next("/");
    return;
  }
  next();
});
export default router;
